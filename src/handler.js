/*eslint linebreak-style: ["error", "windows"]*/
const { nanoid } = require('nanoid');
const books = require('./books');

const postBookHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage } = request.payload;

  // Determine finished and reading status
  const defaultFinished = readPage == pageCount;
  const defaultReading = false;

  // Validate the required fields
  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const bookId = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    bookId, name, year, author, summary, publisher, pageCount, readPage, finished: defaultFinished, reading: defaultReading, insertedAt, updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.some((book) => book.bookId === bookId);

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: newBook.bookId,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request) => {
  const { name, reading, finished } = request.query;

  // Filter the books array based on query parameters
  let filteredBooks = books;

  if (name) {
    const nameLowerCase = name.toLowerCase();
    filteredBooks = filteredBooks.filter((book) =>
      book.name.toLowerCase().includes(nameLowerCase)
    );
  }

  if (reading !== undefined) {
    const isReading = reading === '1';
    filteredBooks = filteredBooks.filter((book) =>
      book.reading === isReading
    );
  }

  if (finished !== undefined) {
    const isFinished = finished === '1';
    filteredBooks = filteredBooks.filter((book) =>
      book.finished === isFinished
    );
  }

  const simplifiedBooks = filteredBooks.map((book) => ({
    id: book.bookId, // Change output column 'bookId' to 'id'
    name: book.name,
    publisher: book.publisher,
  }));

  return {
    status: 'success',
    data: {
      books: simplifiedBooks,
    },
  };
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  // Find the book with the specified bookId
  const book = books.find((n) => n.bookId === bookId);

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book: {
          id: book.bookId,  // Change output column 'bookId' to 'id'
          name: book.name,
          year: book.year,
          author: book.author,
          summary: book.summary,
          publisher: book.publisher,
          pageCount: book.pageCount,
          readPage: book.readPage,
          finished: book.finished,
          reading: book.reading,
          insertedAt: book.insertedAt,
          updatedAt: book.updatedAt,
        },
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const putBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.bookId === bookId);

  // Validate the required fields
  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
      data: {
        bookId: books[index].bookId,
      },
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.bookId === bookId);

  // Validate the required fields
  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  postBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  putBookByIdHandler,
  deleteBookByIdHandler,
};