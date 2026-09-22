/** type → renderer. Adding a block means adding it here too. */

import type { ComponentType } from 'react';
import type { BlockType } from '@/types/builder';
import type { BlockComponentProps } from './primitives';

import {
  AnnouncementBlock, HeroBlock, HeadingBlock, RichTextBlock, ImageTextBlock,
  ImageBlock, VideoBlock, SpacerBlock, DividerBlock, LogosBlock,
} from './ContentBlocks';
import {
  ServicesBlock, BookingCtaBlock, HoursBlock, LocationBlock, ContactBlock,
  SocialBlock, ProductsBlock, ReviewsBlock, FaqBlock, TeamBlock, GalleryBlock,
  BranchesBlock,
} from './BusinessBlocks';
import {
  FeaturesBlock, StatsBlock, StepsBlock, TestimonialsBlock, PricingBlock,
  CountdownBlock, CtaBlock,
} from './MarketingBlocks';

export const BLOCK_RENDERERS: Record<BlockType, ComponentType<BlockComponentProps>> = {
  announcement: AnnouncementBlock,
  hero:         HeroBlock,
  heading:      HeadingBlock,
  richText:     RichTextBlock,
  imageText:    ImageTextBlock,
  image:        ImageBlock,
  video:        VideoBlock,
  spacer:       SpacerBlock,
  divider:      DividerBlock,
  services:     ServicesBlock,
  bookingCta:   BookingCtaBlock,
  hours:        HoursBlock,
  location:     LocationBlock,
  contact:      ContactBlock,
  social:       SocialBlock,
  products:     ProductsBlock,
  reviews:      ReviewsBlock,
  faq:          FaqBlock,
  team:         TeamBlock,
  gallery:      GalleryBlock,
  branches:     BranchesBlock,
  features:     FeaturesBlock,
  stats:        StatsBlock,
  steps:        StepsBlock,
  testimonials: TestimonialsBlock,
  pricing:      PricingBlock,
  logos:        LogosBlock,
  countdown:    CountdownBlock,
  cta:          CtaBlock,
};

export type { BlockComponentProps, BlockCtx } from './primitives';
export { ICON_NAMES, ICONS } from './MarketingBlocks';
