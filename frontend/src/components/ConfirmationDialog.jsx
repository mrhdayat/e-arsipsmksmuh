import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

/**
 * Komponen Dialog Konfirmasi yang dapat digunakan kembali.
 * @param {object} props
 * @param {boolean} props.open - Status apakah dialog terbuka atau tidak.
 * @param {function} props.onClose - Fungsi yang dipanggil saat dialog ditutup (klik Batal atau luar area).
 * @param {function} props.onConfirm - Fungsi yang dipanggil saat tombol konfirmasi (Ya, Hapus) diklik.
 * @param {string} props.title - Judul dialog.
 * @param {string} props.content - Teks isi atau pertanyaan konfirmasi di dalam dialog.
 */
const ConfirmationDialog = ({ open, onClose, onConfirm, title, content }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Batal</Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Ya, Konfirmasi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;