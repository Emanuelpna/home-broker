import { HydratedDocument } from 'mongoose';
import { Schema, SchemaFactory } from '@nestjs/mongoose';

export type AssetDailyDocument = HydratedDocument<AssetDaily>;

@Schema({
  collection: 'AssetDaily',
})
export class AssetDaily {}

export const AssetDailySchema = SchemaFactory.createForClass(AssetDaily);
