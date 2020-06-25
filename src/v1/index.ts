import * as path from 'path';
import * as express from 'express';
import { Request, Response, NextFunction, Router } from 'express';
import * as multer from 'multer';
import * as request from 'request';
import { uuid } from 'uuidv4';

import { Photo } from '../models/Photo';
import logger from '../config/winston_config';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2000000,
  },
});

const uploadLocal = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, './public/');
    },
    filename: (_req, file, cb) => {
      cb(null, uuid() + path.extname(file.originalname));
    },
  }),
});

const API_URL = 'https://openapi.naver.com/v1/vision/face';

const router: Router = express.Router();
const version: string = '1.0.0';

router.get('/', (_req: Request, res: Response) => res.status(200).json({ version }));

router.get('/rankers', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const allRankers = await Photo.findAll({
      order: [['score', 'DESC']],
    });

    const rankers = allRankers.slice(0, 20);

    return res.status(200).json({ rankers, error: 0 });
  } catch (err) {
    return next(err);
  }
});

router.post('/like/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    let photo = await Photo.findOne({ where: { id } });

    if (!photo) {
      return res.status(400).json({ error: 1, errMsg: 'invalid photo id' });
    }

    photo = await photo.update({ like: photo.like + 1 });

    return res.status(200).json({ photo, error: 0 });
  } catch (err) {
    return next(err);
  }
});

router.delete('/like/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    let photo = await Photo.findOne({ where: { id } });

    if (!photo) {
      return res.status(400).json({ error: 2, errMsg: 'invalid photo id' });
    }

    photo = await photo.update({ like: photo.like - 1 });

    return res.status(200).json({ photo, error: 0 });
  } catch (err) {
    return next(err);
  }
});

router.post('/score', upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  const formData = {
    image: req.file.buffer,
  };

  request.post({
    url: API_URL,
    formData,
    headers: {
      'X-Naver-Client-Id': process.env.CLIENT_ID,
      'X-Naver-Client-Secret': process.env.CLIENT_SECRET,
    },
  }, (err, response) => {
    if (err) {
      return next(err);
    }

    const body = JSON.parse(response.body);
    logger.info(JSON.stringify(body));
    let emotion: string;
    let score: number;
    switch (body.info.faceCount) {
      case 1:
        emotion = body.faces[0].emotion.value;
        score = body.faces[0].emotion.confidence * 100;
        break;
      default:
        return res.status(200).json({ faceCount: body.info.faceCount, error: 1 });
    }

    return res.status(200).json({ emotion, score, error: 0 });
  });
});

router.post('/photo', uploadLocal.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  const { nickname, score } = req.body;

  if (!nickname || !score) {
    return res.status(400).json({ error: 3 });
  }

  try {
    const photo = await Photo.create({ nickname, score, url: req.file.filename, like: 0 });

    return res.status(201).json({ photo, error: 0 });
  } catch (err) {
    return next(err);
  }
});

export default router;
