/**
 * ============================================================================
 * Task 2: Student Grade Calculator
 * CodSoft Web Development Internship
 * 
 * Features:
 * - Validates Student Name and 5 Subject Marks (0 - 100)
 * - Calculates Total Marks, Average, Percentage, and Letter Grade
 * - Strictly enforces individual subject passing criteria (<40 is FAIL)
 * - Dynamic animated scorecard with subject breakdown and remarks
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const form = document.getElementById('gradeForm');
  const studentNameInput = document.getElementById('studentName');
  const resetBtn = document.getElementById('resetBtn');

  // Subject Input Elements
  const subjects = [
    { id: 'maths', name: 'Mathematics', input: document.getElementById('maths'), error: document.getElementById('mathsError') },
    { id: 'physics', name: 'Physics', input: document.getElementById('physics'), error: document.getElementById('physicsError') },
    { id: 'chemistry', name: 'Chemistry', input: document.getElementById('chemistry'), error: document.getElementById('chemistryError') },
    { id: 'cs', name: 'Computer Science', input: document.getElementById('cs'), error: document.getElementById('csError') },
    { id: 'english', name: 'English', input: document.getElementById('english'), error: document.getElementById('englishError') }
  ];

  const nameError = document.getElementById('nameError');

  // Result Section Elements
  const placeholderState = document.getElementById('placeholderState');
  const reportContent = document.getElementById('reportContent');
  const resStudentName = document.getElementById('resStudentName');
  const resStatusBadge = document.getElementById('resStatusBadge');
  const resTotal = document.getElementById('resTotal');
  const resPercentage = document.getElementById('resPercentage');
  const resAverage = document.getElementById('resAverage');
  const resGrade = document.getElementById('resGrade');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressBarLabel = document.getElementById('progressBarLabel');
  const subjectChips = document.getElementById('subjectChips');
  const remarksBox = document.getElementById('remarksBox');
  const resRemarks = document.getElementById('resRemarks');

  /**
   * Clears inline validation errors for a specific field
   */
  function clearFieldError(inputEl, errorEl) {
    inputEl.closest('.form-group').classList.remove('has-error');
    errorEl.textContent = '';
  }

  /**
   * Sets inline validation error
   */
  function setFieldError(inputEl, errorEl, message) {
    inputEl.closest('.form-group').classList.add('has-error');
    errorEl.textContent = message;
  }

  // Clear errors as user types
  studentNameInput.addEventListener('input', () => {
    if (studentNameInput.value.trim() !== '') {
      clearFieldError(studentNameInput, nameError);
    }
  });

  subjects.forEach(subject => {
    subject.input.addEventListener('input', () => {
      clearFieldError(subject.input, subject.error);
    });
  });

  /**
   * Form validation logic
   * Returns true if all fields are valid, false otherwise.
   */
  function validateForm() {
    let isValid = true;

    // Validate Student Name
    const nameVal = studentNameInput.value.trim();
    if (!nameVal) {
      setFieldError(studentNameInput, nameError, 'Please enter the student\'s name.');
      isValid = false;
    } else if (nameVal.length < 2) {
      setFieldError(studentNameInput, nameError, 'Name must be at least 2 characters long.');
      isValid = false;
    } else {
      clearFieldError(studentNameInput, nameError);
    }

    // Validate Subject Marks
    subjects.forEach(subject => {
      const rawVal = subject.input.value.trim();

      if (rawVal === '') {
        setFieldError(subject.input, subject.error, `Please enter marks for ${subject.name}.`);
        isValid = false;
      } else {
        const numVal = Number(rawVal);
        if (isNaN(numVal)) {
          setFieldError(subject.input, subject.error, 'Marks must be a valid number.');
          isValid = false;
        } else if (numVal < 0 || numVal > 100) {
          setFieldError(subject.input, subject.error, 'Marks must be between 0 and 100.');
          isValid = false;
        } else {
          clearFieldError(subject.input, subject.error);
        }
      }
    });

    return isValid;
  }

  /**
   * Determines letter grade based on percentage:
   * 90–100: A+
   * 80–89:  A
   * 70–79:  B
   * 60–69:  C
   * 50–59:  D
   * 40–49:  E
   * Below 40: F
   */
  function calculateGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  }

  /**
   * Handles calculation and DOM updates for the report card
   */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const studentName = studentNameInput.value.trim();
    const marksData = [];
    let totalMarks = 0;
    let hasFailedAnySubject = false;

    // Collect marks
    subjects.forEach(subject => {
      const mark = parseFloat(subject.input.value);
      totalMarks += mark;
      const isSubjectPass = mark >= 40;
      if (!isSubjectPass) {
        hasFailedAnySubject = true;
      }
      marksData.push({
        name: subject.name,
        mark: mark,
        isPass: isSubjectPass
      });
    });

    const subjectCount = subjects.length;
    const maxMarks = subjectCount * 100;
    const average = totalMarks / subjectCount;
    const percentage = (totalMarks / maxMarks) * 100;

    // Overall status check:
    // If ANY subject has marks < 40, student is marked FAIL regardless of overall percentage
    const isOverallPass = !hasFailedAnySubject && percentage >= 40;
    const finalGrade = isOverallPass ? calculateGrade(percentage) : 'F';

    // Update UI elements
    resStudentName.textContent = studentName;
    resTotal.textContent = `${totalMarks} / ${maxMarks}`;
    resPercentage.textContent = `${percentage.toFixed(2)}%`;
    resAverage.textContent = `${average.toFixed(2)}`;
    resGrade.textContent = finalGrade;

    // Update Pass / Fail Badge
    if (isOverallPass) {
      resStatusBadge.textContent = 'PASS';
      resStatusBadge.className = 'status-badge pass';
      remarksBox.className = 'remarks-box pass';
      resRemarks.innerHTML = `<strong>Congratulations!</strong> ${studentName} has successfully passed all subjects with an overall score of <strong>${percentage.toFixed(2)}%</strong> (Grade: <strong>${finalGrade}</strong>).`;
    } else {
      resStatusBadge.textContent = 'FAIL';
      resStatusBadge.className = 'status-badge fail';
      remarksBox.className = 'remarks-box fail';
      if (hasFailedAnySubject) {
        resRemarks.innerHTML = `<strong>Attention Required:</strong> Result is marked as <strong>FAIL</strong> because one or more subjects scored below the mandatory minimum passing threshold of 40 marks.`;
      } else {
        resRemarks.innerHTML = `<strong>Result: FAIL</strong> — Overall percentage (${percentage.toFixed(2)}%) is below the minimum required 40%.`;
      }
    }

    // Update Progress Bar
    progressBarLabel.textContent = `${percentage.toFixed(1)}%`;
    progressBarFill.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    progressBarFill.style.background = isOverallPass 
      ? 'linear-gradient(90deg, #4f46e5, #10b981)' 
      : 'linear-gradient(90deg, #f59e0b, #ef4444)';

    // Render Subject breakdown chips
    subjectChips.innerHTML = '';
    marksData.forEach(item => {
      const chip = document.createElement('div');
      chip.className = `chip ${item.isPass ? 'pass' : 'fail'}`;
      chip.innerHTML = `
        <span class="chip-name">${item.name}</span>
        <span class="chip-score">${item.mark}/100 ${item.isPass ? '✓' : '✗ (Fail)'}</span>
      `;
      subjectChips.appendChild(chip);
    });

    // Toggle view states with animation
    placeholderState.style.display = 'none';
    reportContent.style.display = 'block';

    // Smoothly scroll to result if on mobile
    if (window.innerWidth <= 900) {
      reportContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  /**
   * Reset form and restore initial placeholder state
   */
  resetBtn.addEventListener('click', () => {
    form.reset();
    clearFieldError(studentNameInput, nameError);
    subjects.forEach(subject => {
      clearFieldError(subject.input, subject.error);
    });

    // Reset result view
    reportContent.style.display = 'none';
    placeholderState.style.display = 'block';
    progressBarFill.style.width = '0%';
  });
});
