import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Paper } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor dari TinyMCE
import api from '../services/api';
import { useForm, Controller } from 'react-hook-form';

const TemplateSuratPage = () => {
    const [templates, setTemplates] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const { control, handleSubmit, reset } = useForm();

    const fetchTemplates = useCallback(async () => {
        const res = await api.get('/api/templates');
        setTemplates(res.data);
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleOpenForm = (item = null) => {
        if (item) {
            setIsEditing(true);
            setCurrentItem(item);
            reset({ nama: item.nama, subjek: item.subjek, isi: item.isi });
        } else {
            setIsEditing(false);
            setCurrentItem(null);
            reset({ nama: '', subjek: '', isi: '' });
        }
        setOpenForm(true);
    };

    const handleCloseForm = () => setOpenForm(false);

    const onSubmit = async (data) => {
        if (isEditing) {
            await api.put(`/api/templates/${currentItem.id}`, data);
        } else {
            await api.post('/api/templates', data);
        }
        fetchTemplates();
        handleCloseForm();
    };
    
    const handleDelete = async (id) => {
        // Tambahkan konfirmasi sebelum menghapus
        if (window.confirm('Apakah Anda yakin ingin menghapus template ini?')) {
            await api.delete(`/api/templates/${id}`);
            fetchTemplates();
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">Manajemen Template Surat</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenForm()}>Buat Template Baru</Button>
            </Box>

            <Paper>
                <List>
                    {templates.map(template => (
                        <ListItem key={template.id} divider>
                            <ListItemText primary={template.nama} secondary={`Subjek Default: ${template.subjek}`} />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="edit" onClick={() => handleOpenForm(template)}><Edit /></IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(template.id)}><Delete /></IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="lg">
                <DialogTitle>{isEditing ? 'Edit Template' : 'Buat Template Baru'}</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <Controller name="nama" control={control} render={({ field }) => <TextField {...field} label="Nama Template" fullWidth margin="normal" required />} />
                        <Controller name="subjek" control={control} render={({ field }) => <TextField {...field} label="Subjek Default Surat" fullWidth margin="normal" required />} />
                        <Controller
                            name="isi"
                            control={control}
                            render={({ field }) => (
                                <Editor
                                    apiKey="4mshy8foiw97cimt5pfz5p078p1oea42nbhqcwqq3pe12xbv" // <-- Ganti dengan API Key Anda
                                    value={field.value}
                                    onEditorChange={(content) => field.onChange(content)}
                                    init={{
                                        height: 500,
                                        menubar: false,
                                        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                                        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                                    }}
                                />
                            )}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleCloseForm}>Batal</Button>
                        <Button type="submit" variant="contained">Simpan Template</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default TemplateSuratPage;