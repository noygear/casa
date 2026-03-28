import { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, Building2, Plus, Trash2, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useCreateProperty } from '../hooks/useProperties';
import { extractPropertyFromDocument, ExtractedPropertyData } from '../domain/propertyExtractor';

interface PropertyIngestionModalProps {
  onClose: () => void;
  onSubmit?: () => void;
}

const PROPERTY_TYPES = ['Office', 'Mixed-Use', 'Industrial', 'Retail', 'Residential'];

interface SpaceEntry {
  tempId: string;
  name: string;
  floor: string;
  type: 'suite' | 'common_area';
  tenantName: string;
  sqFt: string;
}

export function PropertyIngestionModal({ onClose, onSubmit }: PropertyIngestionModalProps) {
  const createProperty = useCreateProperty();
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [type, setType] = useState('Office');
  const [totalSqFt, setTotalSqFt] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [spaces, setSpaces] = useState<SpaceEntry[]>([]);

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionDone, setExtractionDone] = useState(false);
  const [extractionConfidence, setExtractionConfidence] = useState<number | null>(null);

  const populateFromExtraction = useCallback((data: ExtractedPropertyData) => {
    if (data.name) setName(data.name);
    if (data.address) setAddress(data.address);
    if (data.city) setCity(data.city);
    if (data.state) setState(data.state);
    if (data.zipCode) setZipCode(data.zipCode);
    if (data.type) setType(data.type);
    if (data.totalSqFt) setTotalSqFt(String(data.totalSqFt));
    if (data.yearBuilt) setYearBuilt(String(data.yearBuilt));
    setExtractionConfidence(data.confidence);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setIsExtracting(true);
      setExtractionDone(false);

      // Simulate extraction delay
      setTimeout(() => {
        const extracted = extractPropertyFromDocument(file.name);
        populateFromExtraction(extracted);
        setIsExtracting(false);
        setExtractionDone(true);
      }, 2000);
    }
  }, [populateFromExtraction]);

  const addSpace = () => {
    setSpaces(prev => [...prev, {
      tempId: `temp-${Date.now()}`,
      name: '',
      floor: '1',
      type: 'suite',
      tenantName: '',
      sqFt: '',
    }]);
  };

  const removeSpace = (tempId: string) => {
    setSpaces(prev => prev.filter(s => s.tempId !== tempId));
  };

  const updateSpace = (tempId: string, field: keyof SpaceEntry, value: string) => {
    setSpaces(prev => prev.map(s =>
      s.tempId === tempId ? { ...s, [field]: value } : s
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createProperty.mutateAsync({
        name,
        address,
        city,
        state,
        zipCode,
        type,
        totalSqFt: totalSqFt ? parseInt(totalSqFt) : undefined,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
        spaces: spaces
          .filter(s => s.name)
          .map(s => ({
            name: s.name,
            floor: s.floor ? parseInt(s.floor) : undefined,
            type: s.type,
            tenantName: s.tenantName || undefined,
            sqFt: s.sqFt ? parseInt(s.sqFt) : undefined,
          })),
      });
      onSubmit?.();
      onClose();
    } catch (err) {
      console.error('Failed to create property:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = name && address && city && state && zipCode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 drop-shadow-2xl">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] bg-cre-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cre-500/20 text-cre-400 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add Property</h2>
              <p className="text-sm text-gray-400">Upload a document or enter details manually.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/40 p-1 mx-6 mt-4 rounded-xl w-fit border border-white/5">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'upload' ? 'bg-cre-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Upload size={14} />
            Document Upload
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'manual' ? 'bg-cre-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText size={14} />
            Manual Entry
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Upload Section */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />

              {!uploadedFile && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-12 rounded-xl border-2 border-dashed border-white/10 hover:border-cre-500/30 bg-white/[0.02] hover:bg-cre-500/5 transition-all flex flex-col items-center gap-3"
                >
                  <Upload size={32} className="text-gray-500" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-300">Upload a property document</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, PNG, or JPG — deeds, leases, tax records, listings</p>
                  </div>
                </button>
              )}

              {uploadedFile && isExtracting && (
                <div className="w-full py-12 rounded-xl border border-cre-500/20 bg-cre-500/5 flex flex-col items-center gap-3">
                  <Loader2 size={32} className="text-cre-400 animate-spin" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-cre-400">Extracting property details...</p>
                    <p className="text-xs text-gray-500 mt-1">{uploadedFile.name}</p>
                  </div>
                </div>
              )}

              {uploadedFile && extractionDone && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">
                      Extracted from {uploadedFile.name}
                      {extractionConfidence != null && (
                        <span className="ml-2 text-gray-400">({Math.round(extractionConfidence * 100)}% confidence)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle size={14} className="text-amber-400" />
                    <span className="text-[11px] text-amber-400">AI extraction is a preview feature. Please verify all fields below.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Property Details Form */}
          {(activeTab === 'manual' || extractionDone) && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Property Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Summit Office Plaza"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cre-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                <input
                  required
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street address"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cre-500/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                  <input
                    required
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cre-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                  <input
                    required
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    placeholder="TX"
                    maxLength={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cre-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ZIP</label>
                  <input
                    required
                    type="text"
                    value={zipCode}
                    onChange={e => setZipCode(e.target.value)}
                    placeholder="75201"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cre-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer"
                  >
                    {PROPERTY_TYPES.map(t => (
                      <option key={t} value={t} className="bg-cre-950 text-white">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Total Sq Ft</label>
                  <input
                    type="number"
                    value={totalSqFt}
                    onChange={e => setTotalSqFt(e.target.value)}
                    placeholder="100000"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cre-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Year Built</label>
                  <input
                    type="number"
                    value={yearBuilt}
                    onChange={e => setYearBuilt(e.target.value)}
                    placeholder="2020"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cre-500/50"
                  />
                </div>
              </div>

              {/* Spaces */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">Spaces</label>
                  <button
                    type="button"
                    onClick={addSpace}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Plus size={12} />
                    Add Space
                  </button>
                </div>

                {spaces.length === 0 && (
                  <p className="text-xs text-gray-500 py-3">No spaces added yet. You can add them later.</p>
                )}

                <div className="space-y-3">
                  {spaces.map(space => (
                    <div key={space.tempId} className="glass-surface p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {space.type === 'suite' ? 'Suite' : 'Common Area'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSpace(space.tempId)}
                          className="p-1 rounded text-gray-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={space.name}
                          onChange={e => updateSpace(space.tempId, 'name', e.target.value)}
                          placeholder="Name (e.g. Suite 200)"
                          className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cre-500/50"
                        />
                        <select
                          value={space.type}
                          onChange={e => updateSpace(space.tempId, 'type', e.target.value)}
                          className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer"
                        >
                          <option value="suite" className="bg-cre-950">Suite</option>
                          <option value="common_area" className="bg-cre-950">Common Area</option>
                        </select>
                        <input
                          type="text"
                          value={space.floor}
                          onChange={e => updateSpace(space.tempId, 'floor', e.target.value)}
                          placeholder="Floor"
                          className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cre-500/50"
                        />
                        <input
                          type="text"
                          value={space.tenantName}
                          onChange={e => updateSpace(space.tempId, 'tenantName', e.target.value)}
                          placeholder="Tenant (optional)"
                          className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cre-500/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          {(activeTab === 'manual' || extractionDone) && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Property'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
