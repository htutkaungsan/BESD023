const express = require('express');
const pool = require('../db');

const router = express.Router();
const categories = new Set(['Basic', 'Graphics', 'Coding', 'Other']);

const selectColumns = `
  course_id AS courseId,
  title,
  description,
  duration,
  lecturer,
  category,
  promote,
  course_image AS courseImage
`;

function readCourseId(source) {
  return Number(source.courseId ?? source.course_id ?? source.id);
}

function normalizeCourse(body) {
  return {
    title: typeof body.title === 'string' ? body.title.trim() : '',
    description: typeof body.description === 'string' ? body.description.trim() : '',
    duration: Number(body.duration),
    lecturer: typeof body.lecturer === 'string' ? body.lecturer.trim() : '',
    category: typeof body.category === 'string' ? body.category.trim() : '',
    promote: body.promote === true || body.promote === 1 || body.promote === '1',
    courseImage: typeof (body.courseImage ?? body.course_image) === 'string'
      ? (body.courseImage ?? body.course_image).trim()
      : ''
  };
}

function validateCourse(course) {
  const errors = [];
  if (!course.title || course.title.length > 100) errors.push('title is required and must not exceed 100 characters');
  if (!course.description || course.description.length > 200) errors.push('description is required and must not exceed 200 characters');
  if (!Number.isInteger(course.duration) || course.duration <= 0) errors.push('duration must be a positive integer');
  if (!course.lecturer || course.lecturer.length > 100) errors.push('lecturer is required and must not exceed 100 characters');
  if (!categories.has(course.category)) errors.push('category must be Basic, Graphics, Coding, or Other');
  if (!course.courseImage || course.courseImage.length > 20) errors.push('courseImage is required and must not exceed 20 characters');
  return errors;
}

router.get('/list', async (req, res, next) => {
  try {
    const [courses] = await pool.query(`SELECT ${selectColumns} FROM online_course ORDER BY course_id`);
    res.json(courses);
  } catch (error) {
    next(error);
  }
});

router.get('/search/id', async (req, res, next) => {
  const courseId = readCourseId(req.query);
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({ message: 'A positive courseId query parameter is required' });
  }

  try {
    const [courses] = await pool.execute(
      `SELECT ${selectColumns} FROM online_course WHERE course_id = ?`,
      [courseId]
    );
    if (courses.length === 0) return res.status(404).json({ message: 'Course not found' });
    res.json(courses[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/promote', async (req, res, next) => {
  try {
    const [courses] = await pool.query(
      `SELECT ${selectColumns} FROM online_course WHERE promote = 1 ORDER BY course_id`
    );
    res.json(courses);
  } catch (error) {
    next(error);
  }
});

router.post('/create', async (req, res, next) => {
  const course = normalizeCourse(req.body);
  const errors = validateCourse(course);
  if (errors.length > 0) return res.status(400).json({ result: 0, errors });

  try {
    const [result] = await pool.execute(
      `INSERT INTO online_course
        (title, description, duration, lecturer, category, promote, course_image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [course.title, course.description, course.duration, course.lecturer,
        course.category, course.promote, course.courseImage]
    );
    res.status(201).json({ result: 1, courseId: result.insertId });
  } catch (error) {
    next(error);
  }
});

router.put('/update', async (req, res, next) => {
  const courseId = readCourseId(req.body);
  const course = normalizeCourse(req.body);
  const errors = validateCourse(course);
  if (!Number.isInteger(courseId) || courseId <= 0) errors.unshift('courseId must be a positive integer');
  if (errors.length > 0) return res.status(400).json({ result: 0, errors });

  try {
    const [result] = await pool.execute(
      `UPDATE online_course SET title = ?, description = ?, duration = ?, lecturer = ?,
        category = ?, promote = ?, course_image = ? WHERE course_id = ?`,
      [course.title, course.description, course.duration, course.lecturer,
        course.category, course.promote, course.courseImage, courseId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ result: 0, message: 'Course not found' });
    res.json({ result: 1 });
  } catch (error) {
    next(error);
  }
});

router.delete('/delete', async (req, res, next) => {
  const courseId = readCourseId({ ...req.query, ...req.body });
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({ result: 0, message: 'A positive courseId is required' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM online_course WHERE course_id = ?', [courseId]);
    if (result.affectedRows === 0) return res.status(404).json({ result: 0, message: 'Course not found' });
    res.json({ result: 1 });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
