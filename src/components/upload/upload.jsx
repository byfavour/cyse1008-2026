import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from '../iconify';
import { uploadClasses } from './classes';
import { UploadPlaceholder } from './components/placeholder';
import { RejectionFiles } from './components/rejection-files';
import { MultiFilePreview } from './components/preview-multi-file';
import { DeleteButton, SingleFilePreview } from './components/preview-single-file';

// ----------------------------------------------------------------------

export function Upload({
  sx,
  value,
  error,
  disabled,
  onDelete,
  onUpload,
  onRemove,
  thumbnail,
  helperText,
  onRemoveAll,
  className,
  multiple = false,
  uploadPlaceholderIcon,
  uploadPlaceholderLabel,
  ...other
}) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple,
    disabled,
    ...other,
    onDrop: (acceptedFiles) => {
      console.log('Initial Files Received:', acceptedFiles);

      // Normalize filenames and create a deep clone of each file to ensure clean references
      const normalizedFiles = acceptedFiles.map((file) => {
        // Normalize the extension to lowercase and recreate a new `File` object
        const normalizedFileName = file.name.replace(/\.[^.]+$/, (ext) => ext.toLowerCase());
        const clonedFile = new File([file], normalizedFileName, {
          type: file.type,
          lastModified: file.lastModified,
        });

        // Log each file after normalization
        console.log('Normalized File:', clonedFile);
        return clonedFile;
      });

      // Log the normalizedFiles array
      console.log('Normalized Files Array:', normalizedFiles);

      // Proceed to handle the upload
      if (multiple) {
        if (onUpload) {
          console.log('Starting Upload for Normalized Files:', normalizedFiles);
          onUpload([...value, ...normalizedFiles]);
        }
      } else if (onUpload) {
        console.log('Starting Upload for Single Normalized File:', normalizedFiles[0]);
        onUpload(normalizedFiles[0]);
      }
    },
  });

  const isArray = Array.isArray(value) && multiple;

  const hasFile = !isArray && !!value;

  const hasFiles = isArray && !!value.length;

  const hasError = isDragReject || !!error;

  const renderMultiPreview = hasFiles && (
    <>
      <MultiFilePreview files={value} thumbnail={thumbnail} onRemove={onRemove} sx={{ my: 3 }} />

      {(onRemoveAll || onUpload) && (
        <Box gap={1.5} display="flex" justifyContent="flex-end">
          {onRemoveAll && (
            <Button color="inherit" variant="outlined" size="small" onClick={onRemoveAll}>
              Remove all
            </Button>
          )}

          {onUpload && (
            <Button
              size="small"
              variant="contained"
              onClick={async () => {
                try {
                  console.log('Upload button clicked, initiating upload...');
                  const filesToUpload = value.filter((file) => file instanceof File);
                  if (filesToUpload.length > 0) {
                    await onUpload(filesToUpload); // Pass only File objects to onUpload
                  }
                  console.log('Upload successful!');
                } catch (_error) {
                  console.error('Error during upload:', _error);
                  // Optionally, provide user feedback for the error
                  // toast.error('Upload failed. Please try again.');
                }
              }}
              startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            >
              Upload
            </Button>
          )}
        </Box>
      )}
    </>
  );

  return (
    <Box
      className={uploadClasses.upload.concat(className ? ` ${className}` : '')}
      sx={{ width: 1, position: 'relative', ...sx }}
    >
      <Box
        {...getRootProps()}
        sx={{
          p: 5,
          outline: 'none',
          borderRadius: 1,
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          border: (theme) => `1px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
          transition: (theme) => theme.transitions.create(['opacity', 'padding']),
          '&:hover': { opacity: 0.72 },
          ...(isDragActive && { opacity: 0.72 }),
          ...(disabled && { opacity: 0.48, pointerEvents: 'none' }),
          ...(hasError && {
            color: 'error.main',
            borderColor: 'error.main',
            bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
          }),
          ...(hasFile && { padding: '28% 0' }),
        }}
      >
        <input {...getInputProps()} />

        {/* Single file */}
        {hasFile ? (
          <SingleFilePreview file={value} />
        ) : (
          <UploadPlaceholder icon={uploadPlaceholderIcon} label={uploadPlaceholderLabel} />
        )}
      </Box>

      {/* Single file */}
      {hasFile && <DeleteButton onClick={onDelete} />}

      {helperText && (
        <FormHelperText error={!!error} sx={{ px: 2 }}>
          {helperText}
        </FormHelperText>
      )}

      <RejectionFiles files={fileRejections} />

      {/* Multi files */}
      {renderMultiPreview}
    </Box>
  );
}
