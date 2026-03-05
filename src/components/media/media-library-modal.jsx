import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  Box,
  Grid,
  Card,
  CardMedia,
  Checkbox,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

export default function MediaLibraryModal({ open, onClose, onSelect }) {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    const { data } = await axios.get('/api/images');
    setImages(data.images);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) fetchImages();
  }, [open, fetchImages]);

  const onDrop = useCallback(
    async (files) => {
      const form = new FormData();
      files.forEach((f) => form.append('files', f));
      setLoading(true);
      await axios.post('/api/images', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchImages();
    },
    [fetchImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleApply = () => {
    onSelect(images.filter((img) => selected.has(img.id)));
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 700,
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          m: 'auto',
          mt: 4,
          borderRadius: 1,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6">Select Image</Typography>

        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: 'grey.400',
            borderRadius: 1,
            p: 2,
            mt: 2,
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? <p>Drop files here…</p> : <p>Click or drag images to upload</p>}
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mt: 2, overflowY: 'auto' }}>
            {images.map((img) => (
              <Grid item xs={3} key={img.id}>
                <Card sx={{ position: 'relative' }}>
                  <Checkbox
                    checked={selected.has(img.id)}
                    onChange={() => toggleSelect(img.id)}
                    sx={{ position: 'absolute', top: 4, left: 4, zIndex: 1 }}
                  />
                  <CardMedia component="img" height={120} image={img.url} alt={img.filename} />
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleApply} disabled={selected.size === 0}>
            Insert {selected.size > 1 ? `${selected.size} images` : 'image'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
