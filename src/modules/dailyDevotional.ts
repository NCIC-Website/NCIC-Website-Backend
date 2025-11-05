import cron from 'node-cron';
import { Devotional } from './devotional';

export const startDailyDevotionalPublish = () => {
  // Run daily at 6:00 AM
  cron.schedule('0 6 * * *', async () => {
// cron.schedule('*/10 * * * * *', async () => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Check if a devotional is already published today
      const existing = await Devotional.findOne({
        is_published: true,
        publish_date: { $gte: todayStart, $lte: todayEnd }
      });

      if (existing) {
        console.log('A devotional has already been published today.');
        return;
      }

      // Get the next devotional in queue (oldest unpublished)
      const nextDevotional = await Devotional.findOne({ is_published: false })
        .sort({ created_at: 1 });

      if (!nextDevotional) {
        console.log('No unpublished devotionals in the queue.');
        return;
      }

      // Publish it
      nextDevotional.is_published = true; 
      nextDevotional.publish_date = new Date();
      await nextDevotional.save();
      console.log('Publishing devotional:', nextDevotional.title_am);
      console.log(`Devotional "${nextDevotional.title_am}" published successfully!`);

    } catch (error) {
      console.error('Failed to publish devotional automatically:', error);
    }
  });
};