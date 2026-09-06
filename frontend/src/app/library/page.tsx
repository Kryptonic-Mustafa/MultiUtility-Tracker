'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Search, Plus, Book, Clock, AlertCircle, CheckCircle2, 
  Bookmark, ShieldAlert, ArrowRight, Download, Barcode, Filter
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function LibraryWorkspacePage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'LOANS' | 'FINES'>('CATALOG');
  const [search, setSearch] = useState('');

  // Sample Library Data
  const [books, setBooks] = useState([
    { isbn: '978-0131103627', title: 'The C Programming Language (2nd Ed)', author: 'Brian Kernighan, Dennis Ritchie', category: 'Computer Science', copies: '4 Available', status: 'Available' },
    { isbn: '978-0262033848', title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen, et al.', category: 'Algorithms', copies: '1 Available', status: 'Available' },
    { isbn: '978-0134685991', title: 'Effective Java (3rd Edition)', author: 'Joshua Bloch', category: 'Software Eng', copies: '0 Available', status: 'Borrowed' },
    { isbn: '978-0132350884', title: 'Clean Code: Agile Software Craftsmanship', author: 'Robert C. Martin', category: 'Software Eng', copies: '3 Available', status: 'Available' },
  ]);

  const [activeLoans, setActiveLoans] = useState([
    { id: 'LN-801', member: 'STU-1001 (Alex Johnson)', bookTitle: 'Effective Java (3rd Edition)', issueDate: 'Aug 25', dueDate: 'Sep 08', fine: '$0.00', status: 'Active' },
    { id: 'LN-802', member: 'STU-1005 (David Miller)', bookTitle: 'Artificial Intelligence: A Modern Approach', issueDate: 'Aug 18', dueDate: 'Sep 01', fine: '$5.00', status: 'Overdue' }
  ]);

  const handleAction = (msg: string) => {
    showToast(msg, 'success', 'Library Desk Action');
  };

  const handleIssueBook = (isbn: string, title: string) => {
    showToast(`Issued "${title}" (${isbn}) to member counter.`, 'success', 'Book Issued');
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn.includes(search)
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-r from-[#0b1329] via-[#0f1d3a] to-[#141238] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Module #3 Workspace (module_library)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Digital Library & Resource Management System
          </h1>
          <p className="text-xs text-gray-400 max-w-xl mt-1">
            Barcode book scanning, loan issuance & returns desk, automated overdue fine calculation, and digital PDF downloads.
          </p>
        </div>

        <button
          onClick={() => handleAction('Opening Barcode Scan & Issue Desk...')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-900/40 flex items-center gap-2 hover:opacity-95 transition-all shrink-0"
        >
          <Barcode className="w-4 h-4" />
          Issue Book / Scan ISBN
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Book className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Total Book Titles</div>
            <div className="text-xl font-black text-white">12,450 Volumes</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Active Borrowers</div>
            <div className="text-xl font-black text-white">312 Members</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Overdue Loans</div>
            <div className="text-xl font-black text-rose-400">1 Overdue</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">E-Books & PDFs</div>
            <div className="text-xl font-black text-white">1,840 Files</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'CATALOG'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Book className="w-4 h-4" />
          Book Catalog ({filteredBooks.length})
        </button>

        <button
          onClick={() => setActiveTab('LOANS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'LOANS'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          Active Loans & Returns
        </button>

        <button
          onClick={() => setActiveTab('FINES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'FINES'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Overdue Fines
        </button>
      </div>

      {/* TAB 1: CATALOG */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog by Title, Author or ISBN..."
                className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooks.map((book) => (
              <div key={book.isbn} className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3 hover:border-indigo-500/40 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      ISBN: {book.isbn}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{book.title}</h3>
                    <p className="text-xs text-gray-400">By {book.author}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                    book.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {book.copies}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-[11px] font-bold text-gray-400">{book.category}</span>
                  <button
                    disabled={book.status !== 'Available'}
                    onClick={() => handleIssueBook(book.isbn, book.title)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md disabled:opacity-40 hover:opacity-95 transition-all"
                  >
                    Issue Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LOANS */}
      {activeTab === 'LOANS' && (
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#0f172a] text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Loan ID</th>
                <th className="py-3 px-4">Borrower Member</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Issued</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Accrued Fine</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {activeLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-300">{loan.id}</td>
                  <td className="py-3 px-4 font-bold text-white">{loan.member}</td>
                  <td className="py-3 px-4 max-w-xs truncate">{loan.bookTitle}</td>
                  <td className="py-3 px-4 font-mono text-[11px]">{loan.issueDate}</td>
                  <td className="py-3 px-4 font-mono text-[11px]">{loan.dueDate}</td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-400">{loan.fine}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleAction(`Marking Loan ${loan.id} as RETURNED...`)}
                      className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] transition-all"
                    >
                      Return Book
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: FINES */}
      {activeTab === 'FINES' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white">Library Fine Policies & Overdue Ledger</h3>
          </div>
          <p className="text-xs text-gray-400">
            Standard library late return fine rate is set to <strong>$1.00 per overdue day</strong>. Fines can be settled directly via member portal or library desk.
          </p>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm">STU-1005 (David Miller)</div>
              <div className="text-[11px] text-rose-300">Overdue Book: Artificial Intelligence (5 days late)</div>
            </div>
            <button
              onClick={() => handleAction('Collected $5.00 fine from STU-1005')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Clear & Collect $5.00 Fine
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
