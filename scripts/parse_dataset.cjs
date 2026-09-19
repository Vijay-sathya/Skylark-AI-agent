const fs = require('fs');
const path = require('path');

// Simple CSV parser handling quotes
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx] !== undefined ? values[idx].trim() : '';
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const values = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(cur);
      cur = '';
    } else {
      cur += char;
    }
  }
  values.push(cur);
  return values;
}

const wosRaw = fs.readFileSync(path.join(__dirname, 'work_orders.csv'), 'utf8');
const dealsRaw = fs.readFileSync(path.join(__dirname, 'deals.csv'), 'utf8');

const woRows = parseCSV(wosRaw);
const dealRows = parseCSV(dealsRaw);

console.log(`Parsed ${woRows.length} work orders, ${dealRows.length} deals`);

// Transform Work Orders to RawWorkOrder[]
const rawWorkOrdersData = woRows.map((r, idx) => {
  const serial = r['Serial #'] || `WO-${idx + 1}`;
  const invNo = r['latest invoice no.'] || '';
  const woNum = invNo && invNo !== '-' ? invNo : `SKL-${serial}`;
  const status = r['Execution Status'] || (r['WO Status (billed)'] === 'Closed' ? 'Completed' : 'Ongoing');
  const amountStr = r['Amount in Rupees (Excl of GST) (Masked)'];
  const amtNum = parseFloat(amountStr.replace(/[^\d.]/g, '')) || 0;
  
  let flightHours = 20;
  const qty = r['Quantity by Ops'] || r['Quantities as per PO'] || '';
  if (qty.includes('HA') || qty.includes('Ha')) {
    const ha = parseFloat(qty) || 100;
    flightHours = Math.max(5, Math.min(120, Math.round(ha / 50)));
  } else if (qty.includes('KM') || qty.includes('km') || qty.includes('RKM')) {
    const km = parseFloat(qty) || 50;
    flightHours = Math.max(10, Math.min(150, Math.round(km / 8)));
  } else if (qty.includes('tower') || qty.includes('Towers')) {
    const towers = parseFloat(qty) || 100;
    flightHours = Math.max(12, Math.min(180, Math.round(towers / 10)));
  }

  const isStuck = status.toLowerCase().includes('pause') || status.toLowerCase().includes('struck') || (r['Billing Status'] || '').toLowerCase().includes('stuck');
  const delayReason = isStuck 
    ? 'Airspace clearance / site access dependencies awaiting client resolution.'
    : undefined;

  const notesParts = [];
  if (r['Nature of Work']) notesParts.push(`Nature: ${r['Nature of Work']}`);
  if (r['AR Priority account']) notesParts.push(`AR Priority Account`);
  if (r['Amount Receivable (Masked)'] && parseFloat(r['Amount Receivable (Masked)']) > 0) {
    notesParts.push(`AR: ₹${Math.round(parseFloat(r['Amount Receivable (Masked)'])).toLocaleString()}`);
  }
  if (r['Billing Status']) notesParts.push(`Billing: ${r['Billing Status']}`);

  return {
    id: serial,
    woNumber: woNum,
    dealId: serial,
    clientName: r['Customer Name Code'] || 'WOCOMPANY_ENTERPRISE',
    sector: r['Sector'] || 'General Operations',
    serviceType: r['Type of Work'] || 'Drone Survey & Inspection',
    status: status,
    startDate: r['Probable Start Date'] || r['Date of PO/LOI'] || '2025-05-01',
    targetDeliveryDate: r['Probable End Date'] || '2025-06-30',
    actualDeliveryDate: r['Data Delivery Date'] || (status.toLowerCase().includes('complete') ? r['Probable End Date'] : undefined),
    pilotsAssigned: Math.min(4, Math.max(1, Math.round(flightHours / 25))),
    flightHoursLogged: flightHours,
    billingValue: amtNum > 0 ? `₹${amtNum.toFixed(0)}` : '₹0',
    delayReason: delayReason,
    dronesDeployed: `Skylark Fleet (${r['Type of Work'] || 'Multi-rotor & eVTOL'})`,
    location: 'Pan-India Operational Site',
    notes: notesParts.join(' | ')
  };
});

// Transform Deals to RawDeal[]
const rawDealsData = dealRows.map((r, idx) => {
  const id = `DEAL-AP-${String(idx + 1).padStart(3, '0')}`;
  const name = r['Deal Name'] ? `${r['Deal Name']} - ${r['Client Code'] || 'Enterprise'}` : `Opportunity ${idx + 1}`;
  const clientName = r['Client Code'] || 'Enterprise Client';
  const sector = r['Sector/service'] || 'Commercial';
  const valStr = r['Masked Deal value'] || '0';
  const valNum = parseFloat(valStr.replace(/[^\d.]/g, '')) || 0;
  
  let probability = 50;
  if (r['Deal Status'] === 'Won' || r['Deal Stage']?.includes('Won') || r['Deal Stage']?.includes('Completed')) {
    probability = 100;
  } else if (r['Deal Status'] === 'Dead' || r['Deal Stage']?.includes('Lost') || r['Deal Stage']?.includes('Not relevant')) {
    probability = 0;
  } else if (r['Closure Probability'] === 'High') {
    probability = 80;
  } else if (r['Closure Probability'] === 'Medium') {
    probability = 50;
  } else if (r['Closure Probability'] === 'Low') {
    probability = 25;
  }

  const stage = r['Deal Stage'] || (r['Deal Status'] === 'Won' ? 'G. Project Won' : r['Deal Status'] === 'Dead' ? 'L. Project Lost' : 'B. Sales Qualified Leads');

  const notesParts = [];
  if (r['Product deal']) notesParts.push(`Product: ${r['Product deal']}`);
  if (r['Deal Status']) notesParts.push(`Status: ${r['Deal Status']}`);
  if (r['Created Date']) notesParts.push(`Created: ${r['Created Date']}`);

  return {
    id: id,
    name: name,
    clientName: clientName,
    sector: sector,
    dealValue: valNum > 0 ? `₹${valNum.toFixed(0)}` : '₹0',
    stage: stage,
    expectedCloseDate: r['Tentative Close Date'] || '2026-02-28',
    actualCloseDate: r['Close Date (A)'] || (r['Deal Status'] === 'Won' ? r['Tentative Close Date'] : undefined),
    probability: probability,
    owner: r['Owner code'] || 'OWNER_UNASSIGNED',
    region: 'India',
    notes: notesParts.join(' | ')
  };
});

const fileContent = `import { RawDeal, RawWorkOrder } from '../types';

/**
 * Skylark Drones Enterprise Operational & Sales Assessment Dataset
 * Ingested from real Work Orders Execution Tracker & Deals Sales Funnel
 * Total Work Orders: ${rawWorkOrdersData.length}
 * Total Deals: ${rawDealsData.length}
 */

export const enterpriseDealsData: RawDeal[] = ${JSON.stringify(rawDealsData, null, 2)};

export const enterpriseWorkOrdersData: RawWorkOrder[] = ${JSON.stringify(rawWorkOrdersData, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/assessmentDataset.ts'), fileContent, 'utf8');
console.log('Successfully wrote src/data/assessmentDataset.ts!');
