import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IssueCategory } from '../types';
import { X, Upload, MapPin } from 'lucide-react';
import { backdropVariants, modalVariants, fadeUp, staggerContainer } from '../lib/animations';

interface ReportIssueFormProps {
  onSubmit: (issueData: {
    title: string;
    description: string;
    category: IssueCategory;
    location: {
      block: string;
      floor: string;
      room: string;
    };
    images?: File[];
  }) => Promise<string | null>;
  onCancel: () => void;
}

export function ReportIssueForm({ onSubmit, onCancel }: ReportIssueFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other' as IssueCategory,
    block: '',
    floor: '',
    room: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const categories: IssueCategory[] = [
    'Broken Furniture', 'Water Problem', 'Electrical Fault',
    'Washroom Hygiene', 'Classroom Maintenance', 'Other'
  ];
  const blocks = (import.meta.env.VITE_CAMPUS_BLOCKS || 'Block 1,Block 2,Block 3,Block 4,Main Building,Library Building,Sports Room')
    .split(',')
    .map((item: string) => item.trim())
    .filter(Boolean);
  const floors = (import.meta.env.VITE_CAMPUS_FLOORS || 'Ground Floor,1st Floor,2nd Floor,3rd Floor,4th Floor,5th Floor')
    .split(',')
    .map((item: string) => item.trim())
    .filter(Boolean);

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setShakeError(false);
    requestAnimationFrame(() => setShakeError(true));
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const totalFiles = selectedFiles.length + newFiles.length;

    if (totalFiles > 5) {
      triggerError('You can upload a maximum of 5 images');
      resetFileInput();
      return;
    }

    // Validate each file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of newFiles) {
      if (!allowedTypes.includes(file.type)) {
        triggerError(`"${file.name}" is not a supported image format. Use JPEG, PNG, or WEBP.`);
        resetFileInput();
        return;
      }
      if (file.size > maxSize) {
        triggerError(`"${file.name}" exceeds the 5MB size limit.`);
        resetFileInput();
        return;
      }
    }

    // Generate preview URLs
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));

    setSelectedFiles(prev => [...prev, ...newFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);
    setErrorMessage('');

    // Reset the input so the same file can be selected again
    resetFileInput();
  };

  const removeFile = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(previewUrls[index]);

    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title || !formData.description || !formData.block || !formData.floor || !formData.room) {
      triggerError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    const error = await onSubmit({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: { block: formData.block, floor: formData.floor, room: formData.room },
      images: selectedFiles.length > 0 ? selectedFiles : undefined
    });
    setIsSubmitting(false);

    if (error) triggerError(error);
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent text-sm transition-all bg-gray-50 hover:bg-white";
  const selectClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent text-sm bg-gray-50 hover:bg-white";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ backgroundColor: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => e.target === e.currentTarget && onCancel()}
      >
        <motion.div
          className="bg-white w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-[1.75rem] sm:rounded-[1.75rem]"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-archivo">Report an Issue</h2>
              <p className="text-xs text-gray-400 mt-0.5">Help us improve campus life</p>
            </div>
            <motion.button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <X className="w-5 h-5 text-gray-500" />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <motion.div
              className="space-y-5"
              variants={staggerContainer(0.07, 0.05)}
              initial="hidden"
              animate="visible"
            >
              {/* Error */}
              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div
                    key="err"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${shakeError ? 'shake-error' : ''}`}
                    onAnimationEnd={() => setShakeError(false)}
                  >
                    {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Issue Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the issue"
                  className={inputClass}
                  required
                />
              </motion.div>

              {/* Category */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as IssueCategory })}
                  className={selectClass}
                  required
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </motion.div>

              {/* Description */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about the issue..."
                  rows={4}
                  className={`${inputClass} resize-none`}
                  required
                />
              </motion.div>

              {/* Location */}
              <motion.div variants={fadeUp}>
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">Location Details</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Block <span className="text-red-500">*</span></label>
                      <select value={formData.block} onChange={(e) => setFormData({ ...formData, block: e.target.value })} className={selectClass} required>
                        <option value="">Select</option>
                        {blocks.map((b: string) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Floor <span className="text-red-500">*</span></label>
                      <select value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} className={selectClass} required>
                        <option value="">Select</option>
                        {floors.map((f: string) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Room/Area <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        placeholder="e.g., Lab 301"
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Image Upload */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Upload Images (Optional)
                  {selectedFiles.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      {selectedFiles.length}/5 selected
                    </span>
                  )}
                </label>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleFilesSelected}
                  className="hidden"
                  id="image-upload-input"
                />

                {/* Drop zone / click area */}
                <motion.div
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer"
                  whileHover={{ borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.03)' }}
                  transition={{ duration: 0.2 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Click to upload images</p>
                  <p className="text-xs text-gray-300 mt-1">PNG, JPG, WEBP up to 5MB - Max 5 files</p>
                </motion.div>

                {/* Image Previews */}
                <AnimatePresence>
                  {previewUrls.length > 0 && (
                    <motion.div
                      className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {previewUrls.map((url, index) => (
                        <motion.div
                          key={url}
                          className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                          <motion.button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="w-3 h-3" />
                          </motion.button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-white truncate">{selectedFiles[index]?.name}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Action Buttons */}
              <motion.div className="flex gap-3 pt-2" variants={fadeUp}>
                <motion.button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-[#1A1A2E] hover:bg-[#2d2d44] disabled:bg-gray-300 text-white font-medium rounded-xl transition-colors text-sm"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Issue'}
                </motion.button>
              </motion.div>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
