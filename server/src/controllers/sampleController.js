import * as sampleModel from '../models/sampleModel.js';

export const getSampleData = async (req, res) => {
  try {
    if (!req.params.sampleId) {
      console.log('Missing parameters in request');
      res.status(400).json({ error: 'Bad Request: Missing parameters' });
      return;
    }
    const data = await sampleModel.fetchSampleData(sampleId);
    console.log('Sample data retrieved:', data);
    res.status(200).json(data);
    return;
  } catch (error) {
    console.error('Error fetching sample data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};