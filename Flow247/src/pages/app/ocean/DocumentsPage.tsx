import { useState, useRef } from 'react';
import { FolderOpen, Plus, Search, Filter, FileText, Upload, Download, Trash2, Eye, MoreHorizontal, File, FileImage, FileSpreadsheet, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const mockDocuments = [
  {
    id: 'DOC-001',
    name: 'Bill of Lading - BKG-2024-001.pdf',
    type: 'pdf',
    category: 'Bill of Lading',
    booking: 'BKG-2024-001',
    uploadedBy: 'John Smith',
    uploadedAt: 'Jan 28, 2025 10:30 AM',
    size: '245 KB',
    status: 'Verified',
  },
  {
    id: 'DOC-002',
    name: 'Commercial Invoice - INV-2024-089.pdf',
    type: 'pdf',
    category: 'Commercial Invoice',
    booking: 'BKG-2024-001',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: 'Jan 28, 2025 09:15 AM',
    size: '128 KB',
    status: 'Verified',
  },
  {
    id: 'DOC-003',
    name: 'Packing List - BKG-2024-001.xlsx',
    type: 'excel',
    category: 'Packing List',
    booking: 'BKG-2024-001',
    uploadedBy: 'John Smith',
    uploadedAt: 'Jan 27, 2025 04:45 PM',
    size: '89 KB',
    status: 'Verified',
  },
  {
    id: 'DOC-004',
    name: 'Certificate of Origin.pdf',
    type: 'pdf',
    category: 'Certificate',
    booking: 'BKG-2024-002',
    uploadedBy: 'Mike Chen',
    uploadedAt: 'Jan 27, 2025 02:30 PM',
    size: '156 KB',
    status: 'Pending',
  },
  {
    id: 'DOC-005',
    name: 'Container Photos.zip',
    type: 'image',
    category: 'Photos',
    booking: 'BKG-2024-001',
    uploadedBy: 'Warehouse Team',
    uploadedAt: 'Jan 26, 2025 11:00 AM',
    size: '4.2 MB',
    status: 'Verified',
  },
  {
    id: 'DOC-006',
    name: 'Insurance Certificate.pdf',
    type: 'pdf',
    category: 'Insurance',
    booking: 'BKG-2024-003',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: 'Jan 26, 2025 09:00 AM',
    size: '312 KB',
    status: 'Expired',
  },
];

const documentCategories = [
  'All Documents',
  'Bill of Lading',
  'Commercial Invoice',
  'Packing List',
  'Certificate',
  'Insurance',
  'Photos',
  'Other',
];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'excel':
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    case 'image':
      return <FileImage className="h-5 w-5 text-blue-500" />;
    default:
      return <File className="h-5 w-5 text-muted-foreground" />;
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Verified':
      return { variant: 'success' as const, icon: CheckCircle2 };
    case 'Pending':
      return { variant: 'warning' as const, icon: Clock };
    case 'Expired':
      return { variant: 'destructive' as const, icon: AlertCircle };
    default:
      return { variant: 'secondary' as const, icon: Clock };
  }
};

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Documents');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      toast.success(`Uploading: ${file.name}`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Documentation</h1>
            <p className="text-sm text-muted-foreground">Manage shipping documents and files</p>
          </div>
        </div>
        <Button className="gradient-primary glow-cyan" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Documents
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
        />
      </div>

      {/* Upload Zone */}
      <div
        className={`glass-card rounded-xl p-8 border-2 border-dashed transition-all ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full mb-4 transition-colors ${
            isDragging ? 'bg-primary/20' : 'bg-muted/50'
          }`}>
            <Upload className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {isDragging ? 'Drop files here' : 'Drag and drop files here'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse from your computer
          </p>
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP (Max 25MB)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Documents', value: '248', color: 'text-primary' },
          { label: 'Verified', value: '215', color: 'text-green-500' },
          { label: 'Pending Review', value: '28', color: 'text-amber-500' },
          { label: 'Expired', value: '5', color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents by name or booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {documentCategories.slice(0, 4).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'gradient-primary' : ''}
            >
              {category}
            </Button>
          ))}
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            More
          </Button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockDocuments.map((doc, i) => {
          const statusConfig = getStatusConfig(doc.status);
          return (
            <div
              key={doc.id}
              className="glass-card rounded-xl p-4 hover:border-primary/30 transition-all animate-slide-up cursor-pointer"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" title={doc.name}>{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Category</span>
                  <span>{doc.category}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Booking</span>
                  <span className="text-primary">{doc.booking}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Uploaded</span>
                  <span>{doc.uploadedAt}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant={statusConfig.variant}>
                  {doc.status}
                </Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
