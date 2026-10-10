import type {
  FileItem,
  Folder,
  Conversation,
  User,
  StorageInfo,
  ChatMessage,
  Citation,
  Scope,
  UploadItem,
} from '@/types';
import {
  mockFiles,
  mockFolders,
  mockConversations,
  mockUser,
  mockStorage,
} from '@/lib/mock/data';
import { delay } from '@/lib/utils-format';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const DELAY_MS = 400;

function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export async function listFiles(params?: {
  folderId?: string | null;
  filter?: 'all' | 'recent' | 'starred' | 'trash';
}): Promise<FileItem[]> {
  if (!USE_MOCK) {
    const query = new URLSearchParams();
    if (params?.folderId) query.set('folderId', params.folderId);
    if (params?.filter) query.set('filter', params.filter);
    const res = await fetch(apiUrl(`/files?${query.toString()}`));
    if (!res.ok) throw new Error('Failed to list files');
    return res.json();
  }
  await delay(DELAY_MS);

  let files = [...mockFiles];
  const filter = params?.filter || 'all';

  if (filter === 'starred') {
    files = files.filter((f) => f.starred && !f.trashed);
  } else if (filter === 'trash') {
    files = files.filter((f) => f.trashed);
  } else if (filter === 'recent') {
    files = files
      .filter((f) => !f.trashed)
      .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
      .slice(0, 8);
  } else if (params?.folderId !== undefined) {
    files = files.filter((f) => f.folderId === params.folderId && !f.trashed);
  } else {
    files = files.filter((f) => !f.trashed);
  }

  return files;
}

export async function listFolders(params?: {
  filter?: 'all' | 'starred' | 'trash';
}): Promise<Folder[]> {
  if (!USE_MOCK) {
    const query = new URLSearchParams();
    if (params?.filter) query.set('filter', params.filter);
    const res = await fetch(apiUrl(`/folders?${query.toString()}`));
    if (!res.ok) throw new Error('Failed to list folders');
    return res.json();
  }
  await delay(DELAY_MS);

  let folders = [...mockFolders];
  const filter = params?.filter || 'all';

  if (filter === 'starred') {
    folders = folders.filter((f) => f.starred && !f.trashed);
  } else if (filter === 'trash') {
    folders = folders.filter((f) => f.trashed);
  } else {
    folders = folders.filter((f) => !f.trashed);
  }

  return folders;
}

export async function getFile(id: string): Promise<FileItem | null> {
  if (!USE_MOCK) {
    const res = await fetch(apiUrl(`/files/${id}`));
    if (!res.ok) return null;
    return res.json();
  }
  await delay(DELAY_MS);
  return mockFiles.find((f) => f.id === id) || null;
}

export async function listConversations(): Promise<Conversation[]> {
  if (!USE_MOCK) {
    const res = await fetch(apiUrl('/conversations'));
    if (!res.ok) throw new Error('Failed to list conversations');
    return res.json();
  }
  await delay(DELAY_MS);
  return [...mockConversations];
}

export async function getConversation(id: string): Promise<Conversation | null> {
  if (!USE_MOCK) {
    const res = await fetch(apiUrl(`/conversations/${id}`));
    if (!res.ok) return null;
    return res.json();
  }
  await delay(DELAY_MS);
  return mockConversations.find((c) => c.id === id) || null;
}

export interface AskResponse {
  content: string;
  citations: Citation[];
  sourceFileIds: string[];
  notFound: boolean;
}

export async function askQuestion(
  question: string,
  _conversationId: string,
  _scope: Scope
): Promise<AskResponse> {
  if (!USE_MOCK) {
    const res = await fetch(apiUrl('/ask'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, conversationId: _conversationId, scope: _scope }),
    });
    if (!res.ok) throw new Error('Failed to get answer');
    return res.json();
  }
  await delay(600);

  const q = question.toLowerCase();

  if (q.includes('acme') || q.includes('invoice')) {
    return {
      content:
        'Based on the **Q3 Invoice for Acme Corp**, the total amount is **$48,250.00** [1]. This consists of $42,000 in professional services and $6,250 for infrastructure setup. The invoice was dated September 15, 2026 with a payment due date of October 15, 2026 [1].\n\nAdditionally, there is a separate **Globex Ltd invoice** for $12,800 [2] in the same folder.',
      citations: [
        {
          fileId: 'file_001',
          fileName: 'Q3 Invoice - Acme Corp.pdf',
          page: 1,
          snippet:
            'Total Amount Due: $48,250.00 — Professional Services: $42,000.00, Infrastructure Setup: $6,250.00',
        },
        {
          fileId: 'file_002',
          fileName: 'Invoice - Globex Ltd.pdf',
          page: 1,
          snippet: 'Total Due: $12,800.00 — Consulting Services for August 2026',
        },
      ],
      sourceFileIds: ['file_001', 'file_002'],
      notFound: false,
    };
  }

  if (q.includes('initech') || q.includes('service agreement') || q.includes('contract')) {
    return {
      content:
        'The **Initech Service Agreement** is a 24-month contract running from January 2026 through December 2027 [1]. Key terms:\n\n1. **Annual fee**: $180,000 (billed quarterly)\n2. **SLA**: 99.5% uptime with 4-hour response\n3. **Termination**: 60 days written notice\n4. **Liability cap**: 3 months of fees\n\nThere is also a confidentiality clause on page 8 [1] and an auto-renewal provision unless cancelled 90 days before term end. The full contract is 12 pages [1].\n\nThe **Pied Piper Partnership Agreement** has similar terms but with a 12-month duration and $95,000 annual fee [2].',
      citations: [
        {
          fileId: 'file_004',
          fileName: 'Service Agreement - Initech.pdf',
          page: 3,
          snippet:
            'The term of this Agreement shall commence on January 1, 2026 and continue for twenty-four (24) months.',
        },
        {
          fileId: 'file_006',
          fileName: 'Partnership Agreement - Pied Piper.pdf',
          page: 1,
          snippet: 'Partnership term: 12 months. Annual contribution: $95,000.',
        },
      ],
      sourceFileIds: ['file_004', 'file_006'],
      notFound: false,
    };
  }

  if (q.includes('budget') || q.includes('expense') || q.includes('spend') || q.includes('finance')) {
    return {
      content:
        'Your **Annual Budget 2026** allocates $1.2M across departments [1]:\n\n- Engineering: $480K (40%)\n- Sales & Marketing: $300K (25%)\n- Operations: $240K (20%)\n- G&A: $180K (15%)\n\nQ3 actuals from the **Expense Report** show spending at $287K, which is 4% under budget [2]. The largest line item was cloud infrastructure at $72K [2].\n\n```\nDepartment     | Budget  | Actual  | Variance\nEngineering    | $120K   | $115K   | -$5K\nSales & Mktg   | $75K    | $72K    | -$3K\nOperations     | $60K    | $58K    | -$2K\nG&A            | $45K    | $42K    | -$3K\n```',
      citations: [
        {
          fileId: 'file_011',
          fileName: 'Annual Budget 2026.xlsx',
          page: 1,
          snippet: 'Total Annual Budget: $1,200,000 — Engineering 40%, Sales 25%, Operations 20%, G&A 15%',
        },
        {
          fileId: 'file_012',
          fileName: 'Expense Report Sept.pdf',
          page: 2,
          snippet: 'Q3 Total Spend: $287,000 — Cloud Infrastructure: $72,000 (largest line item)',
        },
      ],
      sourceFileIds: ['file_011', 'file_012'],
      notFound: false,
    };
  }

  if (q.includes('vendor') || q.includes('pricing') || q.includes('comparison')) {
    return {
      content:
        'I found a **Vendor Pricing Comparison** spreadsheet that lists 6 vendors across 4 service categories [1]. The top 3 vendors by total annual cost are:\n\n1. **Acme Corp** — $48,250/yr (professional services + infrastructure)\n2. **Globex Ltd** — $12,800/yr (consulting)\n3. **Initech** — $180,000/yr (managed services) [2]\n\nInitech is the most expensive but includes a 99.5% uptime SLA, while Globex offers the most flexible terms with month-to-month billing [1].',
      citations: [
        {
          fileId: 'file_016',
          fileName: 'Vendor Pricing Comparison.xlsx',
          page: 1,
          snippet: 'Vendor Comparison: Acme $48,250, Globex $12,800, Initech $180,000, Hooli $22,000',
        },
        {
          fileId: 'file_004',
          fileName: 'Service Agreement - Initech.pdf',
          page: 3,
          snippet: 'Annual fee: $180,000 — includes 99.5% uptime SLA',
        },
      ],
      sourceFileIds: ['file_016', 'file_004'],
      notFound: false,
    };
  }

  if (q.includes('expiring') || q.includes('expiry') || q.includes('renew')) {
    return {
      content:
        'I found **2 contracts expiring in 2026** in your files [1]:\n\n1. **Partnership Agreement — Pied Piper** — expires December 31, 2026. Has auto-renewal unless cancelled 60 days prior [1].\n2. **Lease Agreement — Office** — expires November 30, 2026. No auto-renewal; must be renegotiated [2].\n\nI recommend initiating renewal discussions at least 90 days before expiry. The Initech agreement runs through 2027 so it is not affected [3].',
      citations: [
        {
          fileId: 'file_006',
          fileName: 'Partnership Agreement - Pied Piper.pdf',
          page: 6,
          snippet: 'Term expires December 31, 2026. Auto-renews unless 60-day notice given.',
        },
        {
          fileId: 'file_018',
          fileName: 'Lease Agreement - Office.pdf',
          page: 12,
          snippet: 'Lease term: December 1, 2024 — November 30, 2026. No auto-renewal provision.',
        },
        {
          fileId: 'file_004',
          fileName: 'Service Agreement - Initech.pdf',
          page: 3,
          snippet: '24-month term: January 1, 2026 — December 31, 2027.',
        },
      ],
      sourceFileIds: ['file_006', 'file_018', 'file_004'],
      notFound: false,
    };
  }

  return {
    content:
      "I couldn't find this in your files. None of the 15 indexed documents contain information that directly answers this question. Try rephrasing, or upload additional files that might cover this topic.",
    citations: [],
    sourceFileIds: [],
    notFound: true,
  };
}

export async function getUser(): Promise<User> {
  if (!USE_MOCK) {
    const res = await fetch(apiUrl('/me'));
    if (!res.ok) throw new Error('Failed to get user');
    return res.json();
  }
  await delay(200);
  return mockUser;
}

export async function getStorageInfo(): Promise<StorageInfo> {
  if (!USE_MOCK) {
    const res = await fetch(apiUrl('/storage'));
    if (!res.ok) throw new Error('Failed to get storage');
    return res.json();
  }
  await delay(200);
  return mockStorage;
}

export async function reindexFile(fileId: string): Promise<{ success: boolean }> {
  if (!USE_MOCK) {
    const res = await fetch(apiUrl(`/files/${fileId}/reindex`), { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reindex');
    return res.json();
  }
  await delay(800);
  return { success: true };
}

export async function renameConversation(
  id: string,
  title: string
): Promise<{ success: boolean }> {
  if (!USE_MOCK) {
    const res = await fetch(apiUrl(`/conversations/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to rename');
    return res.json();
  }
  await delay(200);
  return { success: true };
}

export async function deleteConversation(id: string): Promise<{ success: boolean }> {
  if (!USE_MOCK) {
    const res = await fetch(apiUrl(`/conversations/${id}`), { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    return res.json();
  }
  await delay(200);
  return { success: true };
}
