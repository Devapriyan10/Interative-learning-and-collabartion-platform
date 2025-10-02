import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { awardPoints, updateUserStats, POINTS } from '../utils/gamification.js';

// Create a new course (Mentor only)
export const createCourse = async (req, res) => {
  try {
    const { title, description, category, tags, difficulty, thumbnail } = req.body;

    const course = new Course({
      title,
      description,
      category,
      tags: tags || [],
      difficulty: difficulty || 'Beginner',
      thumbnail: thumbnail || '',
      mentorId: req.user.id,
      lessons: []
    });

    await course.save();

    // Award points for creating a course
    await awardPoints(req.user.id, POINTS.POST_CREATED, 'Created a course');
    await updateUserStats(req.user.id, 'postsCreated');

    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ success: false, message: 'Failed to create course', error: error.message });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;

    let query = { isPublished: true, isActive: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('mentorId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
  }
};

// Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('mentorId', 'name email avatar role')
      .populate('enrolledStudents', 'name email avatar');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, course });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course', error: error.message });
  }
};

// Enroll in a course (Student only)
export const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    // Check if course is full
    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({ success: false, message: 'Course is full' });
    }

    // Enroll student
    course.enrolledStudents.push(req.user.id);
    course.enrollmentCount = course.enrolledStudents.length;
    await course.save();

    // Update user's enrolled courses
    const user = await User.findById(req.user.id);
    if (!user.enrolledCourses.includes(course._id)) {
      user.enrolledCourses.push(course._id);
      await user.save();
    }

    // Award points
    await awardPoints(req.user.id, 20, 'Enrolled in a course');

    res.json({ success: true, message: 'Successfully enrolled in course', course });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ success: false, message: 'Failed to enroll in course', error: error.message });
  }
};

// Complete a course (Student only)
export const completeCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if enrolled
    if (!course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Not enrolled in this course' });
    }

    // Update user's completed courses
    const user = await User.findById(req.user.id);
    if (!user.completedCourses.includes(course._id)) {
      user.completedCourses.push(course._id);
      await user.save();
    }

    // Update course completion count
    course.completionCount += 1;
    await course.save();

    // Award points and update stats
    await awardPoints(req.user.id, POINTS.COURSE_COMPLETED, 'Completed a course');
    await updateUserStats(req.user.id, 'coursesCompleted');

    res.json({ success: true, message: 'Course completed successfully!' });
  } catch (error) {
    console.error('Error completing course:', error);
    res.status(500).json({ success: false, message: 'Failed to complete course', error: error.message });
  }
};

// Get my courses (Mentor's created courses or Student's enrolled courses)
export const getMyCourses = async (req, res) => {
  try {
    let courses;

    if (req.user.role === 'Mentor') {
      courses = await Course.find({ mentorId: req.user.id })
        .populate('enrolledStudents', 'name email avatar')
        .sort({ createdAt: -1 });
    } else {
      const user = await User.findById(req.user.id)
        .populate({
          path: 'enrolledCourses',
          populate: { path: 'mentorId', select: 'name email avatar' }
        });
      courses = user.enrolledCourses || [];
    }

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching my courses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
  }
};

// Add lesson to course (Mentor only)
export const addLesson = async (req, res) => {
  try {
    const { title, description, content, videoUrl, resources, duration } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if mentor owns this course
    if (course.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const lesson = {
      title,
      description,
      content,
      videoUrl,
      resources: resources || [],
      duration: duration || 0,
      order: course.lessons.length + 1
    };

    course.lessons.push(lesson);
    course.totalDuration = (course.totalDuration || 0) + (duration || 0);
    await course.save();

    res.json({ success: true, message: 'Lesson added successfully', course });
  } catch (error) {
    console.error('Error adding lesson:', error);
    res.status(500).json({ success: false, message: 'Failed to add lesson', error: error.message });
  }
};

// Update course (Mentor only)
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if mentor owns this course
    if (course.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      course[key] = updates[key];
    });

    await course.save();

    res.json({ success: true, message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, message: 'Failed to update course', error: error.message });
  }
};

// Delete course (Mentor only)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if mentor owns this course
    if (course.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, message: 'Failed to delete course', error: error.message });
  }
};
