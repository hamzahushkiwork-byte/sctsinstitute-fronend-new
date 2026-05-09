import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Box,
  Alert,
  LinearProgress,
  Autocomplete,
} from '@mui/material';
import adminClient from '../../../api/adminClient.js';
import { toAbsoluteMediaUrl } from '../../../utils/mediaUrl.js';

export default function MobileSlideFormDialog({ open, slide, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    images: '',
    type: null,
    courseId: '',
    certificateId: '',
    order: 0,
    isActive: true,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (open) {
      loadCoursesAndCertificates();
    }
  }, [open]);

  useEffect(() => {
    if (slide) {
      setFormData({
        title: slide.title || '',
        body: slide.body || '',
        images: slide.images || '',
        type: slide.type || null,
        courseId: slide.courseId?._id || slide.courseId || '',
        certificateId: slide.certificateId?._id || slide.certificateId || '',
        order: slide.order || 0,
        isActive: slide.isActive !== false,
      });
    } else {
      setFormData({
        title: '',
        body: '',
        images: '',
        type: null,
        courseId: '',
        certificateId: '',
        order: 0,
        isActive: true,
      });
    }
    setError('');
  }, [slide, open]);

  const loadCoursesAndCertificates = async () => {
    setLoadingOptions(true);
    try {
      const [coursesRes, certificatesRes] = await Promise.all([
        adminClient.get('/admin/courses'),
        adminClient.get('/admin/certification'),
      ]);
      setCourses(coursesRes.data?.data || []);
      setCertificates(certificatesRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load courses and certificates:', err);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await adminClient.post('/admin/uploads', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success && response.data?.data?.url) {
        setFormData({ ...formData, images: response.data.data.url });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.images) {
        setError('Title and image are required');
        return;
      }

      // Validate type requirements
      if (formData.type === 'course' && !formData.courseId) {
        setError('Please select a course');
        return;
      }
      if (formData.type === 'certificate' && !formData.certificateId) {
        setError('Please select a certificate');
        return;
      }

      const payload = {
        title: formData.title,
        body: formData.body,
        images: formData.images,
        type: formData.type || null,
        courseId: formData.type === 'course' ? formData.courseId : null,
        certificateId: formData.type === 'certificate' ? formData.certificateId : null,
        order: formData.order,
        isActive: formData.isActive,
      };

      if (slide) {
        await adminClient.put(`/admin/mobile-slides/${slide._id || slide.id}`, payload);
      } else {
        await adminClient.post('/admin/mobile-slides', payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save slide');
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value === '' ? null : e.target.value;
    setFormData({
      ...formData,
      type: newType,
      courseId: '',
      certificateId: '',
    });
  };

  const imageUrl = toAbsoluteMediaUrl(formData.images || '');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{slide ? 'Edit Mobile Slide' : 'Add Mobile Slide'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Body (optional)"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          margin="normal"
          multiline
          rows={3}
        />

        <Box sx={{ mt: 2, mb: 1 }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-upload-mobile-slide"
          />
          <label htmlFor="file-upload-mobile-slide">
            <Button variant="outlined" component="span" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </label>
          {uploading && <LinearProgress sx={{ mt: 1 }} />}
        </Box>

        {formData.images && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <img
              src={imageUrl}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
                display: 'block',
                minHeight: '80px',
              }}
              onError={(e) => {
                console.error('[MobileSlideFormDialog] Image failed to load:', imageUrl);
                e.target.style.display = 'none';
              }}
            />
          </Box>
        )}

        <TextField
          fullWidth
          label="Image URL"
          value={formData.images}
          onChange={(e) => setFormData({ ...formData, images: e.target.value })}
          margin="normal"
          helperText="Or paste URL directly"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Link Type</InputLabel>
          <Select value={formData.type || ''} onChange={handleTypeChange} label="Link Type">
            <MenuItem value="">
              <em>No Action (Just Slide)</em>
            </MenuItem>
            <MenuItem value="course">Course</MenuItem>
            <MenuItem value="certificate">Certificate</MenuItem>
          </Select>
        </FormControl>

        {formData.type === 'course' && (
          <FormControl fullWidth margin="normal">
            <Autocomplete
              options={courses}
              getOptionLabel={(option) => option.title || ''}
              value={courses.find((c) => c._id === formData.courseId) || null}
              onChange={(e, newValue) => {
                setFormData({ ...formData, courseId: newValue?._id || '' });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Course" required />
              )}
              loading={loadingOptions}
            />
          </FormControl>
        )}

        {formData.type === 'certificate' && (
          <FormControl fullWidth margin="normal">
            <Autocomplete
              options={certificates}
              getOptionLabel={(option) => option.title || ''}
              value={certificates.find((c) => c._id === formData.certificateId) || null}
              onChange={(e, newValue) => {
                setFormData({ ...formData, certificateId: newValue?._id || '' });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Certificate" required />
              )}
              loading={loadingOptions}
            />
          </FormControl>
        )}

        <TextField
          fullWidth
          label="Order"
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
          margin="normal"
        />

        <FormControlLabel
          control={
            <Switch
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
          }
          label="Active"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
