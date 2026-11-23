const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const env = require('../config/env');
const { logger } = require('../config/db');

const mlApi = axios.create({
  baseURL: env.ML_SERVICE_URL,
  timeout: 30000
});

async function checkHealth() {
  try {
    const res = await mlApi.get('/health');
    return res.data;
  } catch (err) {
    logger.warn(`ML Service health check failed: ${err.message}`);
    return null;
  }
}

async function getTextEmbedding(text) {
  try {
    const res = await mlApi.post('/embed/text', { text });
    return res.data.embedding;
  } catch (err) {
    logger.error(`Error generating text embedding from ML service: ${err.message}`);
    throw new Error(`ML Service Text Embedding failed: ${err.response?.data?.detail || err.message}`);
  }
}

async function getImageEmbedding(filePath) {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const res = await mlApi.post('/embed/image', form, {
      headers: form.getHeaders()
    });
    return res.data.embedding;
  } catch (err) {
    logger.error(`Error generating image embedding from ML service: ${err.message}`);
    throw new Error(`ML Service Image Embedding failed: ${err.response?.data?.detail || err.message}`);
  }
}

async function getMultimodalEmbedding(text, filePath) {
  try {
    const form = new FormData();
    if (text) {
      form.append('text', text);
    }
    if (filePath && fs.existsSync(filePath)) {
      form.append('file', fs.createReadStream(filePath));
    }

    const res = await mlApi.post('/embed/both', form, {
      headers: form.getHeaders()
    });
    return {
      textEmbedding: res.data.text_embedding,
      imageEmbedding: res.data.image_embedding
    };
  } catch (err) {
    logger.error(`Error generating multimodal embeddings: ${err.message}`);
    throw new Error(`ML Service Multimodal Embedding failed: ${err.response?.data?.detail || err.message}`);
  }
}

async function getCrossModalTextEmbedding(text) {
  try {
    const res = await mlApi.post('/embed/cross-modal-text', { text });
    return res.data.embedding;
  } catch (err) {
    logger.error(`Error generating cross-modal text embedding: ${err.message}`);
    throw new Error(`ML Service Cross-Modal Embedding failed: ${err.response?.data?.detail || err.message}`);
  }
}

module.exports = {
  checkHealth,
  getTextEmbedding,
  getImageEmbedding,
  getMultimodalEmbedding,
  getCrossModalTextEmbedding
};
