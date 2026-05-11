import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add, Delete, Edit, Visibility, VisibilityOff } from '@mui/icons-material';
import TrendingCourseFormDialog from './TrendingCourseFormDialog';
import adminClient from '../../../api/adminClient.js';
import { toAbsoluteMediaUrl } from '../../../utils/mediaUrl.js';

export default function TrendingCoursesList() {
  const [trendingCourses, setTrendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [editingTrending, setEditingTrending] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [trendingToDelete, setTrendingToDelete] = useState(null);

  useEffect(() => {
    fetchTrendingCourses();
  }, []);

  const fetchTrendingCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminClient.get('/admin/trending-courses');
      setTrendingCourses(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trending courses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingTrending(null);
    setOpenFormDialog(true);
  };

  const handleEdit = (trending) => {
    setEditingTrending(trending);
    setOpenFormDialog(true);
  };

  const handleFormClose = () => {
    setOpenFormDialog(false);
    setEditingTrending(null);
  };

  const handleFormSuccess = () => {
    fetchTrendingCourses();
    handleFormClose();
  };

  const handleDeleteClick = (trending) => {
    setTrendingToDelete(trending);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminClient.delete(`/admin/trending-courses/${trendingToDelete._id}`);
      setDeleteConfirmOpen(false);
      setTrendingToDelete(null);
      fetchTrendingCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete trending course');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setTrendingToDelete(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Trending Courses
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddNew}>
          Add Trending Course
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Course Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trendingCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No trending courses found. Add one to get started!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              trendingCourses.map((trending) => {
                // Get the image URL and convert to absolute URL
                const imageUrl = trending.courseId?.imageUrl 
                  ? toAbsoluteMediaUrl(trending.courseId.imageUrl)
                  : null;
                
                // Determine which price to display: custom price or course price
                const displayPrice = trending.price !== null && trending.price !== undefined 
                  ? trending.price 
                  : trending.courseId?.price;

                return (
                <TableRow key={trending._id}>
                  <TableCell>{trending.order}</TableCell>
                  <TableCell>
                    {imageUrl ? (
                      <CardMedia
                        component="img"
                        image={imageUrl}
                        alt={trending.courseId.title}
                        sx={{ 
                          width: 80, 
                          height: 60, 
                          objectFit: 'cover', 
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                        onError={(e) => {
                          // If image fails to load, hide it and show placeholder
                          e.target.style.display = 'none';
                          const placeholder = e.target.nextElementSibling;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <Box
                      sx={{
                        width: 80,
                        height: 60,
                        bgcolor: 'grey.200',
                        display: imageUrl ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Typography variant="caption" color="textSecondary">
                        No Image
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {trending.courseId?.title || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {trending.courseId?.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>{trending.courseId?.category || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip label={trending.courseId?.level || 'N/A'} size="small" />
                  </TableCell>
                  <TableCell>
                    {displayPrice ? (
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          ${displayPrice}
                        </Typography>
                        {trending.price !== null && trending.price !== undefined && (
                          <Typography variant="caption" color="primary" sx={{ fontStyle: 'italic' }}>
                            Custom
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="success.main" fontWeight={500}>
                        Free
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {trending.isActive ? (
                      <Chip icon={<Visibility />} label="Active" color="success" size="small" />
                    ) : (
                      <Chip icon={<VisibilityOff />} label="Inactive" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(trending)}
                      title="Edit"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(trending)}
                      title="Delete"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )})
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form Dialog */}
      <TrendingCourseFormDialog
        open={openFormDialog}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editingTrending={editingTrending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove{' '}
            <strong>{trendingToDelete?.courseId?.title || 'this course'}</strong> from trending
            courses?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
