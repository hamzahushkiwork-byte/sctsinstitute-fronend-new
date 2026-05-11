import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import adminClient from '../../../api/adminClient.js';
import MobileSlideFormDialog from './MobileSlideFormDialog.jsx';
import { toAbsoluteMediaUrl } from '../../../utils/mediaUrl.js';

export default function MobileSlidesList() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      const response = await adminClient.get('/admin/mobile-slides');
      const sorted = (response.data?.data || []).sort((a, b) => (a.order || 0) - (b.order || 0));
      setSlides(sorted);
    } catch (error) {
      console.error('Failed to load mobile slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSlide(null);
    setOpenForm(true);
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setOpenForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminClient.delete(`/admin/mobile-slides/${deleteId}`);
      loadSlides();
      setDeleteId(null);
    } catch (error) {
      console.error('Failed to delete mobile slide:', error);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditingSlide(null);
  };

  const handleFormSave = () => {
    loadSlides();
    handleFormClose();
  };

  const getTypeLabel = (slide) => {
    if (!slide.type) return 'No Action';
    if (slide.type === 'course') return `Course: ${slide.courseId?.title || 'N/A'}`;
    if (slide.type === 'certificate') return `Certificate: ${slide.certificateId?.title || 'N/A'}`;
    return slide.type;
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Mobile Slides
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          Add Slide
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : slides.length === 0 ? (
        <Typography sx={{ color: '#666' }}>
          No mobile slides found. Click "Add Slide" to create one.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Link Type</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {slides.map((slide) => (
                <TableRow key={slide._id || slide.id}>
                  <TableCell>
                    {slide.images && (
                      <img
                        src={toAbsoluteMediaUrl(slide.images)}
                        alt={slide.title}
                        style={{
                          width: '80px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {slide.title}
                    </Typography>
                    {slide.body && (
                      <Typography variant="caption" color="text.secondary">
                        {slide.body.substring(0, 50)}
                        {slide.body.length > 50 ? '...' : ''}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{getTypeLabel(slide)}</Typography>
                  </TableCell>
                  <TableCell>{slide.order || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={slide.isActive !== false ? 'Yes' : 'No'}
                      color={slide.isActive !== false ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(slide)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteId(slide._id || slide.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <MobileSlideFormDialog
        open={openForm}
        slide={editingSlide}
        onClose={handleFormClose}
        onSave={handleFormSave}
      />

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Mobile Slide</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this mobile slide?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
