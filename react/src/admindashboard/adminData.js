export const demoAdmins = [
  { id: 'ADM-1001', name: 'Morgan Reed', email: 'morgan.reed@nexora.test', role: 'Super Administrator', status: 'Active' },
  { id: 'ADM-1002', name: 'Casey Park', email: 'casey.park@nexora.test', role: 'Operations Administrator', status: 'Active' },
  { id: 'ADM-1003', name: 'Riley Chen', email: 'riley.chen@nexora.test', role: 'Customer Support', status: 'Active' },
  { id: 'ADM-1004', name: 'Avery Brooks', email: 'avery.brooks@nexora.test', role: 'Read-Only Analyst', status: 'Active' },
]

export const adminRoles = ['Super Administrator', 'Operations Administrator', 'Customer Support', 'Read-Only Analyst']

export const demoCustomers = [
  { id: 'NX-100248', name: 'Jamie Morgan', email: 'jamie.morgan@example.test', phone: '(555) 010-2840', address: '100 Market Street, Portland, OR 97201', status: 'Active', verification: 'Verified', type: 'Personal', joined: '2024-08-12', lastActivity: '2026-10-29', lastLogin: '2026-10-29 08:42', manager: 'Casey Park' },
  { id: 'NX-100319', name: 'Jordan Lee', email: 'jordan.lee@example.test', phone: '(555) 010-1956', address: '24 Pine Avenue, Denver, CO 80202', status: 'Active', verification: 'Pending', type: 'Personal', joined: '2025-01-16', lastActivity: '2026-10-28', lastLogin: '2026-10-28 17:20', manager: 'Morgan Reed' },
  { id: 'NX-100427', name: 'Taylor Morgan', email: 'taylor.morgan@example.test', phone: '(555) 010-7782', address: '84 Lake Road, Austin, TX 78701', status: 'Restricted', verification: 'Needs information', type: 'Personal', joined: '2025-04-03', lastActivity: '2026-10-26', lastLogin: '2026-10-26 13:06', manager: 'Casey Park' },
  { id: 'NX-100512', name: 'Alex Kim', email: 'alex.kim@example.test', phone: '(555) 010-6641', address: '301 Cedar Lane, Seattle, WA 98101', status: 'Active', verification: 'Verified', type: 'Personal', joined: '2025-06-21', lastActivity: '2026-10-29', lastLogin: '2026-10-29 07:55', manager: 'Riley Chen' },
  { id: 'NX-100638', name: 'Sam Rivera', email: 'sam.rivera@example.test', phone: '(555) 010-8831', address: '50 King Street, Chicago, IL 60601', status: 'Suspended', verification: 'Verified', type: 'Business', joined: '2025-07-14', lastActivity: '2026-10-20', lastLogin: '2026-10-20 11:30', manager: 'Morgan Reed' },
  { id: 'NX-100741', name: 'Drew Patel', email: 'drew.patel@example.test', phone: '(555) 010-4072', address: '18 Elm Court, Boston, MA 02108', status: 'Active', verification: 'In review', type: 'Personal', joined: '2025-09-10', lastActivity: '2026-10-28', lastLogin: '2026-10-28 19:12', manager: 'Casey Park' },
  { id: 'NX-100856', name: 'Robin Ellis', email: 'robin.ellis@example.test', phone: '(555) 010-7721', address: '942 Ridge Boulevard, Atlanta, GA 30303', status: 'Active', verification: 'Verified', type: 'Business', joined: '2025-11-05', lastActivity: '2026-10-27', lastLogin: '2026-10-27 09:44', manager: 'Riley Chen' },
  { id: 'NX-100932', name: 'Quinn Bailey', email: 'quinn.bailey@example.test', phone: '(555) 010-3394', address: '77 Willow Drive, Miami, FL 33101', status: 'Pending', verification: 'Pending', type: 'Personal', joined: '2026-10-25', lastActivity: '2026-10-25', lastLogin: 'Not yet signed in', manager: 'Unassigned' },
  { id: 'NX-101046', name: 'Cameron Brooks', email: 'cameron.brooks@example.test', phone: '(555) 010-2765', address: '12 Union Square, San Francisco, CA 94108', status: 'Active', verification: 'Verified', type: 'Personal', joined: '2026-02-13', lastActivity: '2026-10-29', lastLogin: '2026-10-29 09:01', manager: 'Casey Park' },
  { id: 'NX-101173', name: 'Skyler Adams', email: 'skyler.adams@example.test', phone: '(555) 010-5418', address: '290 Lake Street, Minneapolis, MN 55401', status: 'Active', verification: 'Rejected', type: 'Business', joined: '2026-03-19', lastActivity: '2026-10-22', lastLogin: '2026-10-22 16:42', manager: 'Morgan Reed' },
]

export const demoAccounts = [
  { id: 'ACC-20011', customerId: 'NX-100248', name: 'Jamie Morgan', type: 'Checking', number: '00004821', available: 8420.55, current: 8495.55, status: 'Open', opened: '2024-08-12', lastTransaction: '2026-10-28', restriction: '', note: '' },
  { id: 'ACC-20012', customerId: 'NX-100248', name: 'Jamie Morgan', type: 'Savings', number: '00001907', available: 12650, current: 12650, status: 'Open', opened: '2024-08-15', lastTransaction: '2026-10-24', restriction: '', note: '' },
  { id: 'ACC-20031', customerId: 'NX-100319', name: 'Jordan Lee', type: 'Checking', number: '00001184', available: 5740.3, current: 5740.3, status: 'Open', opened: '2025-01-16', lastTransaction: '2026-10-28', restriction: '', note: '' },
  { id: 'ACC-20032', customerId: 'NX-100319', name: 'Jordan Lee', type: 'Savings', number: '00004660', available: 9850, current: 9850, status: 'Open', opened: '2025-02-01', lastTransaction: '2026-10-18', restriction: '', note: '' },
  { id: 'ACC-20044', customerId: 'NX-100427', name: 'Taylor Morgan', type: 'Checking', number: '00007720', available: 2210.9, current: 2210.9, status: 'Restricted', opened: '2025-04-03', lastTransaction: '2026-10-26', restriction: 'Verification review', note: '' },
  { id: 'ACC-20058', customerId: 'NX-100512', name: 'Alex Kim', type: 'Checking', number: '00003506', available: 10840.72, current: 10915.72, status: 'Open', opened: '2025-06-21', lastTransaction: '2026-10-29', restriction: '', note: '' },
  { id: 'ACC-20071', customerId: 'NX-100638', name: 'Sam Rivera', type: 'Business Checking', number: '00009114', available: 18450, current: 18450, status: 'Suspended', opened: '2025-07-14', lastTransaction: '2026-10-20', restriction: 'Account access suspended', note: 'Demo review case under investigation.' },
  { id: 'ACC-20083', customerId: 'NX-100741', name: 'Drew Patel', type: 'Checking', number: '00002435', available: 3490.15, current: 3490.15, status: 'Open', opened: '2025-09-10', lastTransaction: '2026-10-28', restriction: '', note: '' },
  { id: 'ACC-20094', customerId: 'NX-100856', name: 'Robin Ellis', type: 'Business Checking', number: '00006309', available: 32140, current: 32140, status: 'Open', opened: '2025-11-05', lastTransaction: '2026-10-27', restriction: '', note: '' },
  { id: 'ACC-20105', customerId: 'NX-100932', name: 'Quinn Bailey', type: 'Checking', number: '00002814', available: 0, current: 0, status: 'Pending', opened: '2026-10-25', lastTransaction: '—', restriction: '', note: '' },
  { id: 'ACC-20118', customerId: 'NX-101046', name: 'Cameron Brooks', type: 'Checking', number: '00005433', available: 6175.44, current: 6175.44, status: 'Open', opened: '2026-02-13', lastTransaction: '2026-10-29', restriction: '', note: '' },
  { id: 'ACC-20127', customerId: 'NX-101173', name: 'Skyler Adams', type: 'Business Checking', number: '00008652', available: 7850, current: 7850, status: 'Open', opened: '2026-03-19', lastTransaction: '2026-10-22', restriction: '', note: '' },
]

export const demoTransfers = [
  { id: 'TR-780021', customerId: 'NX-100248', senderName: 'Jamie Morgan', senderAccountId: 'ACC-20011', recipientName: 'Jordan Lee', recipientBank: 'Cedar National Bank', recipientAccount: '00001184', method: 'ACH', kind: 'Domestic', amount: 1850, fee: 0, currency: 'USD', rate: null, recipientAmount: 1850, country: 'United States', date: '2026-10-28 10:20', eta: '2026-10-30', status: 'Completed', review: 'Clear', notes: '', events: ['Transfer created', 'ACH processing simulated', 'Marked completed in demo'] },
  { id: 'TR-780034', customerId: 'NX-100319', senderName: 'Jordan Lee', senderAccountId: 'ACC-20031', recipientName: 'Morgan Reed', recipientBank: 'Cedar National Bank', recipientAccount: '00007720', method: 'Domestic wire', kind: 'Domestic', amount: 620, fee: 25, currency: 'USD', rate: null, recipientAmount: 620, country: 'United States', date: '2026-10-28 14:15', eta: '2026-10-29', status: 'Pending', review: 'Needs review', notes: 'Demo amount threshold rule triggered.', events: ['Transfer created', 'Queued for demo operations review'] },
  { id: 'TR-780048', customerId: 'NX-100427', senderName: 'Taylor Morgan', senderAccountId: 'ACC-20044', recipientName: 'Riley Morgan', recipientBank: 'Summit Credit Union', recipientAccount: '00003506', method: 'ACH', kind: 'Domestic', amount: 290, fee: 0, currency: 'USD', rate: null, recipientAmount: 290, country: 'United States', date: '2026-10-27 11:03', eta: '2026-10-30', status: 'Failed', review: 'Clear', notes: 'Demo return code: recipient details did not validate.', events: ['Transfer created', 'Validation failed in demo'] },
  { id: 'TR-780059', customerId: 'NX-100512', senderName: 'Alex Kim', senderAccountId: 'ACC-20058', recipientName: 'Mina Kim', recipientBank: 'North Coast Bank', recipientAccount: '00009342', method: 'ACH', kind: 'Domestic', amount: 475, fee: 0, currency: 'USD', rate: null, recipientAmount: 475, country: 'United States', date: '2026-10-27 15:46', eta: '2026-10-30', status: 'Completed', review: 'Clear', notes: '', events: ['Transfer created', 'Completed in demo'] },
  { id: 'TR-780072', customerId: 'NX-100638', senderName: 'Sam Rivera', senderAccountId: 'ACC-20071', recipientName: 'Harbor Office Supply', recipientBank: 'Harbor Business Bank', recipientAccount: '00001331', method: 'Domestic wire', kind: 'Domestic', amount: 2480, fee: 25, currency: 'USD', rate: null, recipientAmount: 2480, country: 'United States', date: '2026-10-20 09:24', eta: '2026-10-21', status: 'Pending', review: 'Needs review', notes: 'Associated with restricted demo account.', events: ['Transfer created', 'Account status flagged for review'] },
  { id: 'TR-780088', customerId: 'NX-100741', senderName: 'Drew Patel', senderAccountId: 'ACC-20083', recipientName: 'Asha Patel', recipientBank: 'Summit Credit Union', recipientAccount: '00006402', method: 'ACH', kind: 'Domestic', amount: 160, fee: 0, currency: 'USD', rate: null, recipientAmount: 160, country: 'United States', date: '2026-10-26 18:02', eta: '2026-10-29', status: 'Completed', review: 'Clear', notes: '', events: ['Transfer created', 'Completed in demo'] },
  { id: 'TR-790014', customerId: 'NX-100319', senderName: 'Jordan Lee', senderAccountId: 'ACC-20031', recipientName: 'Ava Lee', recipientBank: 'London Sample Bank', recipientAccount: '•••• 6114', method: 'International wire', kind: 'International', amount: 920, fee: 35, currency: 'GBP', rate: 0.79, recipientAmount: 726.8, country: 'United Kingdom', swift: 'LONSGB2LXXX', date: '2026-10-26 08:45', eta: '2026-10-31', status: 'Pending', review: 'Needs review', notes: '', events: ['Transfer created', 'Illustrative sanctions screen pending in demo'] },
  { id: 'TR-790025', customerId: 'NX-100512', senderName: 'Alex Kim', senderAccountId: 'ACC-20058', recipientName: 'Sora Kim', recipientBank: 'Tokyo Demo Bank', recipientAccount: '•••• 8217', method: 'International wire', kind: 'International', amount: 540, fee: 35, currency: 'JPY', rate: 149.3, recipientAmount: 80622, country: 'Japan', swift: 'TYKDJPJTXXX', date: '2026-10-25 16:18', eta: '2026-10-30', status: 'Completed', review: 'Clear', notes: '', events: ['Transfer created', 'Demo review completed', 'Marked completed in demo'] },
  { id: 'TR-790039', customerId: 'NX-100856', senderName: 'Robin Ellis', senderAccountId: 'ACC-20094', recipientName: 'Ellis Studio Ltd', recipientBank: 'Banque Exemple', recipientAccount: '•••• 0498', method: 'International wire', kind: 'International', amount: 2100, fee: 35, currency: 'EUR', rate: 0.92, recipientAmount: 1932, country: 'France', swift: 'EXAMFRPPXXX', date: '2026-10-24 13:50', eta: '2026-10-29', status: 'Failed', review: 'Flagged', notes: 'Demo currency details need confirmation.', events: ['Transfer created', 'Flagged by demo rule'] },
]

export const demoTransactions = [
  { id: 'TX-50001', customerId: 'NX-100248', accountId: 'ACC-20011', transferId: '', date: '2026-10-29 08:12', type: 'Deposit', description: 'Northstar Payroll', amount: 3250, fee: 0, currency: 'USD', direction: 'Incoming', status: 'Completed', source: 'ACH' },
  { id: 'TX-50002', customerId: 'NX-100248', accountId: 'ACC-20011', transferId: 'TR-780021', date: '2026-10-28 10:20', type: 'Domestic transfer', description: 'Transfer to Jordan Lee', amount: -1850, fee: 0, currency: 'USD', direction: 'Outgoing', status: 'Completed', source: 'ACH' },
  { id: 'TX-50003', customerId: 'NX-100248', accountId: 'ACC-20011', transferId: '', date: '2026-10-27 14:31', type: 'Card purchase', description: 'Fresh Market', amount: -86.42, fee: 0, currency: 'USD', direction: 'Outgoing', status: 'Completed', source: 'Debit card' },
  { id: 'TX-50004', customerId: 'NX-100248', accountId: 'ACC-20011', transferId: '', date: '2026-10-26 09:20', type: 'Bill payment', description: 'Electric Utility Co.', amount: -112.7, fee: 0, currency: 'USD', direction: 'Outgoing', status: 'Pending', source: 'Bill pay' },
  { id: 'TX-50005', customerId: 'NX-100319', accountId: 'ACC-20031', transferId: 'TR-780034', date: '2026-10-28 14:15', type: 'Domestic transfer', description: 'Domestic wire to Morgan Reed', amount: -620, fee: 25, currency: 'USD', direction: 'Outgoing', status: 'Pending', source: 'Wire' },
  { id: 'TX-50006', customerId: 'NX-100319', accountId: 'ACC-20031', transferId: 'TR-790014', date: '2026-10-26 08:45', type: 'International transfer', description: 'Wire to Ava Lee · United Kingdom', amount: -920, fee: 35, currency: 'USD', direction: 'Outgoing', status: 'Pending', source: 'International wire' },
  { id: 'TX-50007', customerId: 'NX-100427', accountId: 'ACC-20044', transferId: 'TR-780048', date: '2026-10-27 11:03', type: 'Domestic transfer', description: 'ACH to Riley Morgan', amount: -290, fee: 0, currency: 'USD', direction: 'Outgoing', status: 'Failed', source: 'ACH' },
  { id: 'TX-50008', customerId: 'NX-100512', accountId: 'ACC-20058', transferId: 'TR-780059', date: '2026-10-27 15:46', type: 'Domestic transfer', description: 'ACH to Mina Kim', amount: -475, fee: 0, currency: 'USD', direction: 'Outgoing', status: 'Completed', source: 'ACH' },
  { id: 'TX-50009', customerId: 'NX-100512', accountId: 'ACC-20058', transferId: 'TR-790025', date: '2026-10-25 16:18', type: 'International transfer', description: 'Wire to Sora Kim · Japan', amount: -540, fee: 35, currency: 'USD', direction: 'Outgoing', status: 'Completed', source: 'International wire' },
  { id: 'TX-50010', customerId: 'NX-100638', accountId: 'ACC-20071', transferId: 'TR-780072', date: '2026-10-20 09:24', type: 'Domestic transfer', description: 'Wire to Harbor Office Supply', amount: -2480, fee: 25, currency: 'USD', direction: 'Outgoing', status: 'Pending', source: 'Wire' },
  { id: 'TX-50011', customerId: 'NX-100741', accountId: 'ACC-20083', transferId: 'TR-780088', date: '2026-10-26 18:02', type: 'Domestic transfer', description: 'ACH to Asha Patel', amount: -160, fee: 0, currency: 'USD', direction: 'Outgoing', status: 'Completed', source: 'ACH' },
  { id: 'TX-50012', customerId: 'NX-100856', accountId: 'ACC-20094', transferId: 'TR-790039', date: '2026-10-24 13:50', type: 'International transfer', description: 'Wire to Ellis Studio · France', amount: -2100, fee: 35, currency: 'USD', direction: 'Outgoing', status: 'Failed', source: 'International wire' },
  { id: 'TX-50013', customerId: 'NX-101046', accountId: 'ACC-20118', transferId: '', date: '2026-10-29 09:01', type: 'Deposit', description: 'Monthly payroll', amount: 2890, fee: 0, currency: 'USD', direction: 'Incoming', status: 'Completed', source: 'ACH' },
  { id: 'TX-50014', customerId: 'NX-101173', accountId: 'ACC-20127', transferId: '', date: '2026-10-22 12:45', type: 'Card purchase', description: 'Lakeside Business Supply', amount: -345.6, fee: 0, currency: 'USD', direction: 'Outgoing', status: 'Completed', source: 'Debit card' },
  { id: 'TX-50015', customerId: 'NX-100248', accountId: 'ACC-20012', transferId: '', date: '2026-10-24 12:00', type: 'Account transfer', description: 'Transfer from checking', amount: 400, fee: 0, currency: 'USD', direction: 'Incoming', status: 'Completed', source: 'Internal transfer' },
]

export const demoBeneficiaries = [
  { id: 'BEN-1001', customerId: 'NX-100248', name: 'Jordan Lee', bank: 'Cedar National Bank', country: 'United States', account: '00001184', type: 'Checking', dateAdded: '2025-02-13', status: 'Active', method: 'Domestic' },
  { id: 'BEN-1002', customerId: 'NX-100319', name: 'Ava Lee', bank: 'London Sample Bank', country: 'United Kingdom', account: '•••• 6114', type: 'Checking', dateAdded: '2026-05-10', status: 'Active', method: 'International' },
  { id: 'BEN-1003', customerId: 'NX-100512', name: 'Sora Kim', bank: 'Tokyo Demo Bank', country: 'Japan', account: '•••• 8217', type: 'Savings', dateAdded: '2026-03-22', status: 'Active', method: 'International' },
  { id: 'BEN-1004', customerId: 'NX-100427', name: 'Riley Morgan', bank: 'Summit Credit Union', country: 'United States', account: '00003506', type: 'Checking', dateAdded: '2025-08-01', status: 'Review', method: 'Domestic' },
  { id: 'BEN-1005', customerId: 'NX-100856', name: 'Ellis Studio Ltd', bank: 'Banque Exemple', country: 'France', account: '•••• 0498', type: 'Business', dateAdded: '2026-04-08', status: 'Active', method: 'International' },
]

export const demoCards = demoCustomers.slice(0, 7).map((customer, index) => ({
  id: `CARD-${String(3001 + index).padStart(4, '0')}`,
  customerId: customer.id,
  customerName: customer.name,
  number: `•••• •••• •••• ${['4821', '1184', '7720', '3506', '9114', '2435', '6309'][index]}`,
  type: index === 4 || index === 6 ? 'Business debit' : 'Debit',
  expiry: `0${(index % 8) + 1}/2${8 + (index % 3)}`,
  status: index === 4 ? 'Frozen' : 'Active',
  limit: [2500, 1800, 3000, 2200, 8000, 1600, 5000][index],
}))

export const demoVerification = [
  { id: 'VER-4101', customerId: 'NX-100319', status: 'Pending', required: 'Address proof review', missing: 'Address document review required', reviewer: 'Casey Park', date: '2026-10-27', note: '' },
  { id: 'VER-4102', customerId: 'NX-100427', status: 'Needs information', required: 'Proof of address', missing: 'Current address document not provided', reviewer: 'Morgan Reed', date: '2026-10-26', note: 'Demo request sent to customer.' },
  { id: 'VER-4103', customerId: 'NX-100741', status: 'In review', required: 'Identity document review', missing: 'Document review in progress', reviewer: 'Casey Park', date: '2026-10-28', note: '' },
  { id: 'VER-4104', customerId: 'NX-100932', status: 'Pending', required: 'Identity and address', missing: 'Fictional documents not supplied in demo', reviewer: 'Unassigned', date: '2026-10-25', note: '' },
  { id: 'VER-4105', customerId: 'NX-101173', status: 'Rejected', required: 'Business verification', missing: 'Demo information did not meet sample checks', reviewer: 'Morgan Reed', date: '2026-10-22', note: 'Synthetic rejection reason for interface testing.' },
]

export const demoTickets = [
  { id: 'SUP-6001', customerId: 'NX-100248', category: 'Transfer question', related: 'TR-780021', priority: 'Normal', status: 'Open', date: '2026-10-28', assigned: 'Riley Chen', notes: '' },
  { id: 'SUP-6002', customerId: 'NX-100427', category: 'Account restriction', related: 'ACC-20044', priority: 'High', status: 'In review', date: '2026-10-27', assigned: 'Casey Park', notes: 'Review fictional verification hold.' },
  { id: 'SUP-6003', customerId: 'NX-100512', category: 'International payment', related: 'TR-790025', priority: 'Normal', status: 'Resolved', date: '2026-10-26', assigned: 'Riley Chen', notes: '' },
  { id: 'SUP-6004', customerId: 'NX-100638', category: 'Account access', related: 'ACC-20071', priority: 'Urgent', status: 'Open', date: '2026-10-21', assigned: 'Morgan Reed', notes: 'Synthetic restricted-account support ticket.' },
]

export const demoNotifications = [
  { id: 'NTF-7001', title: 'Domestic transfer requires review', body: 'TR-780034 is waiting in the demo review queue.', date: '2026-10-29 09:32', read: false, href: '/admin/domestic-transfers' },
  { id: 'NTF-7002', title: 'New customer verification', body: 'Quinn Bailey has a pending demo verification case.', date: '2026-10-28 15:10', read: false, href: '/admin/compliance' },
  { id: 'NTF-7003', title: 'International transfer flagged', body: 'TR-790039 was flagged by an illustrative demo rule.', date: '2026-10-28 12:40', read: false, href: '/admin/international-transfers' },
  { id: 'NTF-7004', title: 'Support ticket opened', body: 'SUP-6004 is marked urgent in the demo queue.', date: '2026-10-27 16:05', read: true, href: '/admin/support' },
]

export const demoAuditLogs = [
  { id: 'AUD-9001', date: '2026-10-29 09:32', adminId: 'ADM-1002', action: 'Transfer flagged', target: 'TR-780034', reason: 'Amount threshold rule', result: 'Flagged in demo' },
  { id: 'AUD-9002', date: '2026-10-28 15:14', adminId: 'ADM-1001', action: 'Verification assigned', target: 'VER-4103', reason: 'Routine review', result: 'Assigned in demo' },
  { id: 'AUD-9003', date: '2026-10-27 10:04', adminId: 'ADM-1002', action: 'Account restricted', target: 'ACC-20044', reason: 'Verification review', result: 'Updated in demo' },
  { id: 'AUD-9004', date: '2026-10-26 14:19', adminId: 'ADM-1003', action: 'Support ticket updated', target: 'SUP-6003', reason: 'Customer question resolved', result: 'Resolved in demo' },
  { id: 'AUD-9005', date: '2026-10-25 12:10', adminId: 'ADM-1001', action: 'Admin sign-in', target: 'ADM-1001', reason: 'Demo session', result: 'Successful demo sign-in' },
]

export const demoSystemStatus = [
  { service: 'Transfer processing', status: 'Simulated', note: 'No payment network connected' },
  { service: 'Identity verification', status: 'Simulated', note: 'Synthetic case data only' },
  { service: 'Notifications', status: 'Demo data', note: 'Local interface state only' },
  { service: 'Banking APIs', status: 'Not connected', note: 'Backend integration not configured' },
]

export const ADMIN_PAYMENT_SOURCE = { id: 'DEMO-TREASURY-01', name: 'Demo funding source', available: 250000, currency: 'USD' }

export const ADMIN_ROUTE_ITEMS = [
  { label: 'Dashboard Overview', path: '/admin', icon: 'gauge', group: 'OPERATIONS' },
  { label: 'User Management', path: '/admin/users', icon: 'users', group: 'CUSTOMERS' },
  { label: 'Bank Accounts', path: '/admin/accounts', icon: 'wallet', group: 'CUSTOMERS' },
  { label: 'Beneficiaries', path: '/admin/beneficiaries', icon: 'beneficiaries', group: 'CUSTOMERS' },
  { label: 'Domestic Transfers', path: '/admin/domestic-transfers', icon: 'transfer', group: 'PAYMENTS' },
  { label: 'International Transfers', path: '/admin/international-transfers', icon: 'globe', group: 'PAYMENTS' },
  { label: 'All Transactions', path: '/admin/transactions', icon: 'transactions', group: 'PAYMENTS' },
  { label: 'Administrative Payments', path: '/admin/payments', icon: 'payment', group: 'PAYMENTS', permission: 'payments' },
  { label: 'Cards Management', path: '/admin/cards', icon: 'card', group: 'PAYMENTS', permission: 'operations' },
  { label: 'Account Restrictions', path: '/admin/restrictions', icon: 'restriction', group: 'RISK' },
  { label: 'Compliance & Verification', path: '/admin/compliance', icon: 'compliance', group: 'RISK', permission: 'operations' },
  { label: 'Reports & Analytics', path: '/admin/reports', icon: 'reports', group: 'INSIGHTS' },
  { label: 'Notifications', path: '/admin/notifications', icon: 'notifications', group: 'INSIGHTS' },
  { label: 'Support & Disputes', path: '/admin/support', icon: 'support', group: 'INSIGHTS' },
  { label: 'Admin Activity Logs', path: '/admin/activity', icon: 'activity', group: 'ADMINISTRATION' },
  { label: 'Staff & Permissions', path: '/admin/staff', icon: 'staff', group: 'ADMINISTRATION', permission: 'super' },
  { label: 'System Settings', path: '/admin/settings', icon: 'settings', group: 'ADMINISTRATION', permission: 'super' },
]

export function adminMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
}

export function adminDate(value, withTime = false) {
  if (!value || value === '—') return '—'
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  return new Intl.DateTimeFormat('en-US', withTime
    ? { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export function maskBankAccount(value) {
  const digits = String(value).replace(/\D/g, '')
  return `•••• ${digits.slice(-4) || '••••'}`
}

export function adminInitials(name) {
  return String(name).split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

export function hasAdminPermission(role, permission) {
  if (role === 'Super Administrator') return true
  if (role === 'Read-Only Analyst') return false
  if (role === 'Customer Support') return permission === 'support'
  if (role === 'Operations Administrator') return ['operations', 'payments', 'support'].includes(permission)
  return false
}
