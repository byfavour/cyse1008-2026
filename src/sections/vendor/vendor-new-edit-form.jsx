'use client';

import { z as zod } from 'zod';
import { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';

import { addVendor, updateVendor } from 'src/lib/firebase/vendors';

// ----------------------------------------------------------------------

const VendorSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }),
  description: zod.string().optional().default(''),
  contactEmail: zod.string().email({ message: 'Invalid email' }).optional().or(zod.literal('')),
  contactPhone: zod.string().optional().default(''),
  website: zod.string().url({ message: 'Invalid URL' }).optional().or(zod.literal('')),
  address: zod.string().optional().default(''),
  isActive: zod.boolean().default(true),
});

// ----------------------------------------------------------------------

export function VendorNewEditForm({ currentVendor, loading }) {
  const router = useRouter();
  const { user } = useAuthContext();

  const defaultValues = useMemo(
    () => ({
      name: currentVendor?.name || '',
      description: currentVendor?.description || '',
      contactEmail: currentVendor?.contactEmail || '',
      contactPhone: currentVendor?.contactPhone || '',
      website: currentVendor?.website || '',
      address: currentVendor?.address || '',
      isActive: currentVendor?.isActive ?? true,
    }),
    [currentVendor]
  );

  const methods = useForm({
    resolver: zodResolver(VendorSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentVendor) {
      reset(defaultValues);
    }
  }, [currentVendor, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentVendor?.id) {
        await updateVendor(currentVendor.id, data);
        toast.success('Vendor updated');
      } else {
        const payload = { ...data, ownerId: user?.uid || null };
        console.log('[Firestore] request.resource.data =', payload);
        console.log('[Firestore] request.auth.uid =', user?.uid);
        console.log('[Firestore] ownerId matches uid =', payload.ownerId === user?.uid);
        await addVendor(payload);
        toast.success('Vendor created');
      }
      router.push(paths.dashboard.vendor.root);
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
    }
  });

  const isCreate = !currentVendor?.id;
  const ownerId = currentVendor?.ownerId || user?.uid || null;

  return (
    <>
      {/* Security context — for classroom demo */}
      {isCreate && (
        <Card variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.neutral' }}>
          <Stack spacing={1.5}>
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>
              Security context — create rule
            </Typography>

            <Stack direction="row" alignItems="flex-start" spacing={2}>
              <Typography variant="caption" sx={{ color: 'text.disabled', width: 140, flexShrink: 0 }}>
                Your UID (request.auth.uid)
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {user?.uid ?? 'unauthenticated'}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="flex-start" spacing={2}>
              <Typography variant="caption" sx={{ color: 'text.disabled', width: 140, flexShrink: 0 }}>
                ownerId to be written
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {ownerId ?? '—'}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="caption" sx={{ color: 'text.disabled', width: 140, flexShrink: 0 }}>
                IDs match?
              </Typography>
              <Chip
                size="small"
                label={ownerId === user?.uid ? 'Yes — create will be allowed ✅' : 'No — create will be blocked 🔒'}
                color={ownerId === user?.uid ? 'success' : 'error'}
              />
            </Stack>

            <Divider />

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Rule: <code>allow create: if signedIn() &amp;&amp; request.resource.data.ownerId == request.auth.uid</code>
            </Typography>
          </Stack>
        </Card>
      )}

    <Card sx={{ p: 3 }}>
      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Field.Text name="name" label="Vendor name" />
          <Field.Text name="description" label="Description" multiline rows={4} />

          <Field.Text name="contactEmail" label="Contact email" />
          <Field.Text name="contactPhone" label="Contact phone" />

          <Field.Text name="website" label="Website" />
          <Field.Text name="address" label="Address" multiline rows={3} />

          <FormControlLabel control={<Field.Switch name="isActive" />} label="Active" />

          <LoadingButton
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting || loading}
          >
            {currentVendor ? 'Save changes' : 'Create vendor'}
          </LoadingButton>
        </Stack>
      </Form>
    </Card>
    </>
  );
}
