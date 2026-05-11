import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import adminClient from '../../../api/adminClient.js';

export default function TrendingCourseFormDialog({ open, onClose, onSuccess, editingTrending }) {
  const [formData, setFormData] = useState({
    courseId: null,
    order: 0,
    price: '',
    isActive: true,
  });
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchCourses();
      if (editingTrending) {
        setFormData({
          courseId: editingTrending.courseId,
          order: editingTrending.order || 0,
          price: editingTrending.price !== null && editingTrending.price !== undefined ? editingTrending.price : '',
          isActive: editingTrending.isActive !== undefined ? editingTrending.isActive : true,
        });
      } else {
        setFormData({
          courseId: null,
          order: 0,
          price: '',
          isActive: true,
        });
      }
      setError(null);
    }
  }, [open, editingTrending]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await adminClient.get('/admin/courses');
      setCourses(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.courseId) {
        setError('Please select a course');
        setLoading(false);
        return;
      }

      const payload = {
        courseId: formData.courseId._id,
        order: Number(formData.order),
        price: formData.price !== '' ? Number(formData.price) : null,
        isActive: formData.isActive,
      };

      if (editingTrending) {
        // Update
        await adminClient.put(`/admin/trending-courses/${editingTrending._id}`, payload);
      } else {
        // Create
        await adminClient.post('/admin/trending-courses', payload);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save trending course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingTrending ? 'Edit Trending Course' : 'Add Trending Course'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Course Selection */}
          <Autocomplete
            options={courses}
            getOptionLabel={(option) => option.title || ''}
            value={formData.courseId}
            onChange={(e, newValue) => handleChange('courseId', newValue)}
            loading={loadingCourses}
            disabled={!!editingTrending} // Can't change course when editing
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Course"
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingCourses ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option._id}>
                <Box>
                  <div>{option.title}</div>
                  <small style={{ color: 'gray' }}>
                    {option.category} • {option.level}
                  </small>
                </Box>
              </li>
            )}
          />

          {/* Order */}
          <TextField
            label="Order"
            type="number"
            value={formData.order}
            onChange={(e) => handleChange('order', e.target.value)}
            fullWidth
            helperText="Lower numbers appear first"
          />

          {/* Custom Price */}
          <TextField
            label="Custom Price (Optional)"
            type="number"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            fullWidth
            placeholder={formData.courseId?.price ? `Default: $${formData.courseId.price}` : 'Leave empty to use course price'}
            helperText={
              formData.price !== '' 
                ? `Custom price: $${formData.price}` 
                : formData.courseId?.price 
                  ? `Will use course price: $${formData.courseId.price}`
                  : 'Enter a custom price or leave empty to use the course price'
            }
            InputProps={{
              startAdornment: formData.price !== '' ? <span style={{ marginRight: '4px' }}>$</span> : null,
            }}
          />

          {/* Active Status */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
              />
            }
            label="Active"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : editingTrending ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
