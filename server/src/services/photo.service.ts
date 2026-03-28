import prisma from '../prisma.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import type { PhotoType } from '@prisma/client';

interface UploadPhotoInput {
  workOrderId: string;
  url: string;
  type: PhotoType;
  caption?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAccuracy?: number;
}

export async function uploadPhoto(input: UploadPhotoInput) {
  const workOrder = await prisma.workOrder.findUnique({
    where: { id: input.workOrderId },
  });

  if (!workOrder) {
    throw new NotFoundError('WorkOrder', input.workOrderId);
  }

  return prisma.workOrderPhoto.create({
    data: {
      workOrderId: input.workOrderId,
      url: input.url,
      type: input.type,
      caption: input.caption,
      gpsLatitude: input.gpsLatitude,
      gpsLongitude: input.gpsLongitude,
      gpsAccuracy: input.gpsAccuracy,
      gpsCapturedAt: input.gpsLatitude ? new Date() : undefined,
    },
  });
}

export async function getPhotos(workOrderId: string) {
  return prisma.workOrderPhoto.findMany({
    where: { workOrderId },
    orderBy: { uploadedAt: 'asc' },
  });
}
