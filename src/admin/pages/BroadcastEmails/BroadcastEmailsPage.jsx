import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Send } from '@mui/icons-material';
import {
  getBroadcastEmailHistory,
  sendBroadcastEmail,
} from '../../../api/broadcastEmail.api.js';
import PageTransition from '../../components/PageTransition.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function BroadcastEmailsPage() {
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [includeAdmins, setIncludeAdmins] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const data = await getBroadcastEmailHistory();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showSnackbar(e.response?.data?.message || e.message || 'Failed to load history', 'error');
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !text.trim()) {
      showSnackbar('Subject and message are required.', 'warning');
      return;
    }
    if (
      !window.confirm(
        'Send this email to all selected users? This may take a minute for large lists.',
      )
    ) {
      return;
    }
    setSending(true);
    try {
      const res = await sendBroadcastEmail({
        subject: subject.trim(),
        text: text.trim(),
        html: '',
        includeAdmins,
      });
      const d = res.data;
      showSnackbar(
        res.message ||
          `Sent: ${d?.successCount ?? 0}, failed: ${d?.failCount ?? 0}, recipients: ${d?.recipientCount ?? 0}`,
        d?.failCount > 0 ? 'warning' : 'success',
      );
      await loadLogs();
    } catch (e) {
      showSnackbar(
        e.response?.data?.message || e.message || 'Send failed',
        'error',
      );
    } finally {
      setSending(false);
    }
  };

  const columns = [
    {
      field: 'createdAt',
      headerName: 'Sent at',
      width: 180,
      renderCell: (params) =>
        params.value ? new Date(params.value).toLocaleString() : '',
    },
    { field: 'subject', headerName: 'Subject', flex: 1, minWidth: 160 },
    {
      field: 'textPreview',
      headerName: 'Message preview',
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ whiteSpace: 'normal', py: 0.5 }}>
          {(params.value || '').slice(0, 120)}
          {(params.value || '').length > 120 ? '…' : ''}
        </Typography>
      ),
    },
    {
      field: 'recipientCount',
      headerName: 'Recipients',
      width: 100,
    },
    {
      field: 'successCount',
      headerName: 'OK',
      width: 70,
    },
    {
      field: 'failCount',
      headerName: 'Fail',
      width: 70,
    },
    {
      field: 'includeAdmins',
      headerName: 'Inc. admins',
      width: 110,
      renderCell: (params) => (params.value ? 'Yes' : 'No'),
    },
    {
      field: 'sentByEmail',
      headerName: 'Sent by',
      flex: 0.8,
      minWidth: 140,
    },
  ];

  return (
    <PageTransition>
      <Box>
        <PageHeader
          title="Email all users"
          subtitle="Send the same message to every registered account. History is stored below."
        />

        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Use placeholders in subject or body:{' '}
            <strong>{'{{firstName}}'}</strong>, <strong>{'{{lastName}}'}</strong>,{' '}
            <strong>{'{{email}}'}</strong>
          </Typography>
          <Box component="form" onSubmit={handleSend} noValidate>
            <TextField
              label="Subject"
              fullWidth
              required
              margin="normal"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              inputProps={{ maxLength: 200 }}
            />
            <TextField
              label="Message (plain text)"
              fullWidth
              required
              multiline
              minRows={8}
              margin="normal"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Dear {{firstName}},&#10;&#10;..."
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeAdmins}
                  onChange={(e) => setIncludeAdmins(e.target.checked)}
                />
              }
              label="Include admin accounts (default: registered users only)"
              sx={{ mt: 1, display: 'block' }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <Send />}
              disabled={sending}
              sx={{ mt: 2 }}
            >
              {sending ? 'Sending…' : 'Send to all users'}
            </Button>
          </Box>
        </Paper>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Send history
        </Typography>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataGrid
            rows={logs}
            columns={columns}
            loading={loadingLogs}
            getRowId={(row) => row._id || row.id}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            sx={{ minHeight: 360, border: 'none' }}
          />
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={8000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageTransition>
  );
}
