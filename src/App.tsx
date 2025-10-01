import { useState, useEffect } from 'react';
import { Calendar, Clock, Settings, FileText, Plus, Trash2, Edit2, X } from 'lucide-react';

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
}

interface ContractInfo {
  monthlyFee: number;
  baseHours: number;
}

interface InvoiceInfo {
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  senderEmail: string;
  bankName: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  clientCompany: string;
  clientName: string;
  clientAddress: string;
}

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [contract, setContract] = useState<ContractInfo>({
    monthlyFee: 400000,
    baseHours: 140
  });
  const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo>({
    senderName: '',
    senderAddress: '',
    senderPhone: '',
    senderEmail: '',
    bankName: '',
    branchName: '',
    accountType: '普通',
    accountNumber: '',
    accountHolder: '',
    clientCompany: '',
    clientName: '',
    clientAddress: ''
  });
  const [newEntry, setNewEntry] = useState({ date: '', hours: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const savedEntries = localStorage.getItem('timeEntries');
    const savedContract = localStorage.getItem('contract');
    const savedInvoiceInfo = localStorage.getItem('invoiceInfo');
    
    if (savedEntries) setTimeEntries(JSON.parse(savedEntries));
    if (savedContract) setContract(JSON.parse(savedContract));
    if (savedInvoiceInfo) setInvoiceInfo(JSON.parse(savedInvoiceInfo));
  }, []);

  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  useEffect(() => {
    localStorage.setItem('contract', JSON.stringify(contract));
  }, [contract]);

  useEffect(() => {
    localStorage.setItem('invoiceInfo', JSON.stringify(invoiceInfo));
  }, [invoiceInfo]);

  const addTimeEntry = () => {
    if (!newEntry.date || newEntry.hours <= 0) return;
    
    const entry: TimeEntry = {
      id: Date.now().toString(),
      date: newEntry.date,
      hours: newEntry.hours
    };
    
    setTimeEntries([...timeEntries, entry].sort((a, b) => a.date.localeCompare(b.date)));
    setNewEntry({ date: '', hours: 0 });
  };

  const deleteTimeEntry = (id: string) => {
    setTimeEntries(timeEntries.filter(entry => entry.id !== id));
  };

  const updateTimeEntry = (id: string, hours: number) => {
    setTimeEntries(timeEntries.map(entry => 
      entry.id === id ? { ...entry, hours } : entry
    ));
    setEditingId(null);
  };

  const getMonthlyHours = (month: string) => {
    return timeEntries
      .filter(entry => entry.date.startsWith(month))
      .reduce((sum, entry) => sum + entry.hours, 0);
  };

  const calculateInvoiceAmount = (month: string) => {
    const totalHours = getMonthlyHours(month);
    const hourlyRate = contract.monthlyFee / contract.baseHours;
    const diff = totalHours - contract.baseHours;
    const adjustment = diff * hourlyRate;
    
    return {
      totalHours,
      baseAmount: contract.monthlyFee,
      hourlyRate: Math.round(hourlyRate),
      overtime: diff > 0 ? diff : 0,
      undertime: diff < 0 ? Math.abs(diff) : 0,
      adjustment: Math.round(adjustment),
      finalAmount: Math.round(contract.monthlyFee + adjustment)
    };
  };

  const DashboardTab = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const stats = calculateInvoiceAmount(currentMonth);
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">今月のサマリー</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">総勤務時間</div>
            <div className="text-3xl font-bold text-blue-700">{stats.totalHours}h</div>
          </div>
          
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">基準時間</div>
            <div className="text-3xl font-bold text-green-700">{contract.baseHours}h</div>
          </div>
          
          <div className={`${stats.adjustment >= 0 ? 'bg-purple-50 border-purple-200' : 'bg-orange-50 border-orange-200'} border-2 rounded-lg p-4`}>
            <div className={`text-sm font-medium ${stats.adjustment >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>
              {stats.adjustment >= 0 ? '超過時間' : '不足時間'}
            </div>
            <div className={`text-3xl font-bold ${stats.adjustment >= 0 ? 'text-purple-700' : 'text-orange-700'}`}>
              {stats.adjustment >= 0 ? stats.overtime : stats.undertime}h
            </div>
          </div>
          
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
            <div className="text-sm text-indigo-600 font-medium">請求予定額</div>
            <div className="text-2xl font-bold text-indigo-700">¥{stats.finalAmount.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">最近の勤務記録</h3>
          <div className="space-y-2">
            {timeEntries
              .filter(entry => entry.date.startsWith(currentMonth))
              .slice(-5)
              .reverse()
              .map(entry => (
                <div key={entry.id} className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-700">{entry.date}</span>
                  <span className="font-semibold text-blue-600">{entry.hours}時間</span>
                </div>
              ))}
            {timeEntries.filter(entry => entry.date.startsWith(currentMonth)).length === 0 && (
              <p className="text-gray-400 text-center py-4">まだ勤務記録がありません</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const TimesheetTab = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">勤務記録</h2>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">新規記録</h3>
          <div className="flex gap-4 flex-wrap">
            <input
              type="date"
              value={newEntry.date}
              onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="勤務時間"
              value={newEntry.hours || ''}
              onChange={(e) => setNewEntry({ ...newEntry, hours: parseFloat(e.target.value) || 0 })}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none w-32"
              step="0.5"
              min="0"
            />
            <button
              onClick={addTimeEntry}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus size={20} />
              追加
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">記録一覧</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4">日付</th>
                  <th className="text-left py-3 px-4">勤務時間</th>
                  <th className="text-right py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {timeEntries.map(entry => (
                  <tr key={entry.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{entry.date}</td>
                    <td className="py-3 px-4">
                      {editingId === entry.id ? (
                        <input
                          type="number"
                          defaultValue={entry.hours}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateTimeEntry(entry.id, parseFloat(e.currentTarget.value));
                            }
                          }}
                          className="px-2 py-1 border rounded w-24"
                          step="0.5"
                          autoFocus
                        />
                      ) : (
                        `${entry.hours}時間`
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {editingId === entry.id ? (
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:text-gray-800 p-2"
                        >
                          <X size={18} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingId(entry.id)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteTimeEntry(entry.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {timeEntries.length === 0 && (
              <p className="text-gray-400 text-center py-8">まだ勤務記録がありません</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SettingsTab = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">設定</h2>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">契約情報</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">月額報酬（円）</label>
              <input
                type="number"
                value={contract.monthlyFee}
                onChange={(e) => setContract({ ...contract, monthlyFee: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">基準時間（時間/月）</label>
              <input
                type="number"
                value={contract.baseHours}
                onChange={(e) => setContract({ ...contract, baseHours: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                時給換算: ¥{Math.round(contract.monthlyFee / contract.baseHours).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">請求者情報（あなた）</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">氏名</label>
              <input
                type="text"
                value={invoiceInfo.senderName}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, senderName: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">住所</label>
              <input
                type="text"
                value={invoiceInfo.senderAddress}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, senderAddress: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                <input
                  type="tel"
                  value={invoiceInfo.senderPhone}
                  onChange={(e) => setInvoiceInfo({ ...invoiceInfo, senderPhone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                <input
                  type="email"
                  value={invoiceInfo.senderEmail}
                  onChange={(e) => setInvoiceInfo({ ...invoiceInfo, senderEmail: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">振込先情報</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">銀行名</label>
                <input
                  type="text"
                  value={invoiceInfo.bankName}
                  onChange={(e) => setInvoiceInfo({ ...invoiceInfo, bankName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">支店名</label>
                <input
                  type="text"
                  value={invoiceInfo.branchName}
                  onChange={(e) => setInvoiceInfo({ ...invoiceInfo, branchName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">口座種別</label>
                <select
                  value={invoiceInfo.accountType}
                  onChange={(e) => setInvoiceInfo({ ...invoiceInfo, accountType: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="普通">普通</option>
                  <option value="当座">当座</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">口座番号</label>
                <input
                  type="text"
                  value={invoiceInfo.accountNumber}
                  onChange={(e) => setInvoiceInfo({ ...invoiceInfo, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">口座名義</label>
              <input
                type="text"
                value={invoiceInfo.accountHolder}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, accountHolder: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">請求先情報（クライアント）</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">会社名</label>
              <input
                type="text"
                value={invoiceInfo.clientCompany}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, clientCompany: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">担当者名</label>
              <input
                type="text"
                value={invoiceInfo.clientName}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, clientName: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">住所</label>
              <input
                type="text"
                value={invoiceInfo.clientAddress}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, clientAddress: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InvoiceTab = () => {
    const stats = calculateInvoiceAmount(selectedMonth);
    const invoiceDate = new Date().toISOString().split('T')[0];
    const invoiceNumber = `INV-${selectedMonth.replace('-', '')}`;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-gray-800">請求書作成</h2>
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">対象月:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              印刷
            </button>
          </div>
        </div>

        <div id="invoice" className="bg-white rounded-lg shadow p-8">
          <div className="border-b-2 border-gray-300 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-center mb-2">請求書</h1>
            <div className="flex justify-between text-sm">
              <div>請求書番号: {invoiceNumber}</div>
              <div>発行日: {invoiceDate}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-3 border-b pb-2">請求先</h3>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-base">{invoiceInfo.clientCompany || '未設定'}</p>
                <p>{invoiceInfo.clientName ? `${invoiceInfo.clientName} 様` : ''}</p>
                <p className="text-gray-600">{invoiceInfo.clientAddress}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-3 border-b pb-2">請求者</h3>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-base">{invoiceInfo.senderName || '未設定'}</p>
                <p className="text-gray-600">{invoiceInfo.senderAddress}</p>
                <p className="text-gray-600">TEL: {invoiceInfo.senderPhone}</p>
                <p className="text-gray-600">Email: {invoiceInfo.senderEmail}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="text-sm text-gray-600 mb-1">ご請求金額</div>
              <div className="text-3xl font-bold text-blue-600">¥{stats.finalAmount.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">（税込）</div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-3 border-b pb-2">明細</h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4 border">項目</th>
                  <th className="text-right py-2 px-4 border">数量</th>
                  <th className="text-right py-2 px-4 border">単価</th>
                  <th className="text-right py-2 px-4 border">金額</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 border">業務委託料（基本）</td>
                  <td className="text-right py-2 px-4 border">{contract.baseHours}時間</td>
                  <td className="text-right py-2 px-4 border">¥{stats.hourlyRate.toLocaleString()}</td>
                  <td className="text-right py-2 px-4 border">¥{stats.baseAmount.toLocaleString()}</td>
                </tr>
                {stats.adjustment !== 0 && (
                  <tr>
                    <td className="py-2 px-4 border">
                      {stats.adjustment > 0 ? '超過勤務分' : '不足時間控除'}
                    </td>
                    <td className="text-right py-2 px-4 border">
                      {stats.adjustment > 0 ? stats.overtime : stats.undertime}時間
                    </td>
                    <td className="text-right py-2 px-4 border">¥{stats.hourlyRate.toLocaleString()}</td>
                    <td className="text-right py-2 px-4 border">
                      {stats.adjustment > 0 ? '+' : '-'}¥{Math.abs(stats.adjustment).toLocaleString()}
                    </td>
                  </tr>
                )}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={3} className="text-right py-2 px-4 border">合計</td>
                  <td className="text-right py-2 px-4 border">¥{stats.finalAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-3 border-b pb-2">勤務実績</h3>
            <div className="text-sm space-y-1 bg-gray-50 p-4 rounded">
              <p>対象期間: {selectedMonth}</p>
              <p>総勤務時間: {stats.totalHours}時間</p>
              <p>基準時間: {contract.baseHours}時間</p>
              <p>差分: {stats.adjustment > 0 ? '+' : ''}{(stats.totalHours - contract.baseHours).toFixed(1)}時間</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3 border-b pb-2">振込先</h3>
            <div className="text-sm space-y-1">
              <p>{invoiceInfo.bankName} {invoiceInfo.branchName}</p>
              <p>{invoiceInfo.accountType} {invoiceInfo.accountNumber}</p>
              <p>口座名義: {invoiceInfo.accountHolder}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t text-xs text-gray-500 text-center">
            <p>お振込期限: {new Date(new Date(invoiceDate).setMonth(new Date(invoiceDate).getMonth() + 1)).toISOString().split('T')[0]}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">フリーランス勤怠管理</h1>
          <p className="text-gray-600">勤怠管理と請求書作成を簡単に</p>
        </header>

        <nav className="bg-white rounded-lg shadow mb-6">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              } rounded-l-lg`}
            >
              <Calendar size={20} />
              ダッシュボード
            </button>
            <button
              onClick={() => setActiveTab('timesheet')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'timesheet'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Clock size={20} />
              勤務記録
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings size={20} />
              設定
            </button>
            <button
              onClick={() => setActiveTab('invoice')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'invoice'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              } rounded-r-lg`}
            >
              <FileText size={20} />
              請求書
            </button>
          </div>
        </nav>

        <main key={activeTab}>
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'timesheet' && <TimesheetTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'invoice' && <InvoiceTab />}
        </main>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice, #invoice * {
            visibility: visible;
          }
          #invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          nav, header, button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
