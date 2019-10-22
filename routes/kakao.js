const express = require('express');
const router = express.Router();
const axios = require('axios');
const { parseDate } = require('../utils');

// router.get('/', booksController.getAll);
// router.post('/new', verifyToken, articlesController.create);
// router.put('/:article_id', verifyToken, articlesController.update);
// router.delete('/:article_id', verifyToken, articlesController.delete);

const BOOK_URL = 'https://dapi.kakao.com/v3/search/book';

const kakaoApi = axios.create({
  baseURL: 'dapi.kakao.com',
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Host': 'dapi.kakao.com',
    'Authorization': `KakaoAK ${process.env.KAKAO_RESTKEY}`,
  },
});

const getBookApi = (query, page = 1) => {
  const params = {
    query,
    page
  };

  return kakaoApi.get(BOOK_URL, {
    params
  });
}

router.get('/search', async (req, res) => {
  try {
    const { query, page } = req.query;
    const books = await getBookApi(query, page);
    const { status, statusText, data } = books;

    if (status === 200) {
      const {
        meta: {
          total_count,
          pageable_count,
          is_end
        },
        documents
      } = data;

      const books = {
        isEnd: is_end,
        pageableCount: pageable_count,
        totalCount: total_count,
        items: (documents && documents.length) ? documents
          .filter(({
            thumbnail
          }) => !!thumbnail)
          .map(({
            title,
            url,
            isbn,
            datetime,
            authors,
            publisher,
            thumbnail
          }, index) => {
            return {
              title,
              url,
              // isbn,
              isbn: isbn ? isbn.split(' ')[0] : [],
              authors: typeof(authors) === 'string' ? [authors] : authors,
              pubdate: parseDate(datetime),
              publisher,
              thumbnail
            }
          }) : []
      }

      res.status(200).json({
        books,
        result: 'ok'
      });
    } else {
      throw new Error(`${status}:${statusText}`);
    }
  } catch (err) {
    console.error(err);
    return res.status(401).send({ err });
  }
});

module.exports = router;
