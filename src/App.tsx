import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Settings, FileText, Plus, Trash2, Edit2, X } from 'lucide-react';

// Types
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

  const c
