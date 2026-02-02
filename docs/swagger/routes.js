/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Health check endpoint
 *   - name: Surveys
 *     description: Survey management endpoints
 *   - name: Questions
 *     description: Question management endpoints
 *   - name: Answers
 *     description: Answer submission and retrieval endpoints
 *   - name: Statistics
 *     description: Survey statistics endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: OK
 */

/**
 * @swagger
 * /surveys:
 *   get:
 *     summary: List all surveys
 *     description: Returns all surveys. Admins see surveys they have access to, answerers see surveys shared with them.
 *     tags: [Surveys]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *       - $ref: '#/components/parameters/userRole'
 *     responses:
 *       200:
 *         description: List of surveys
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 surveys:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Survey'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   post:
 *     summary: Create a new survey
 *     description: Create a new survey with optional questions. Requires ADMIN role.
 *     tags: [Surveys]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *       - $ref: '#/components/parameters/userRole'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Survey title
 *                 example: Employee Engagement Survey
 *               questions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/QuestionInput'
 *           example:
 *             title: Employee Engagement Survey
 *             questions:
 *               - text: How satisfied are you with your current role?
 *                 type: RATING
 *                 rating_min: 1
 *                 rating_max: 5
 *               - text: Do you feel supported by your manager?
 *                 type: BOOLEAN
 *               - text: What is one thing we could improve?
 *                 type: TEXT
 *     responses:
 *       200:
 *         description: Survey created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - ADMIN role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /surveys/{surveyId}:
 *   get:
 *     summary: Get survey by ID
 *     tags: [Surveys]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *       - $ref: '#/components/parameters/userRole'
 *       - in: path
 *         name: surveyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The survey ID
 *     responses:
 *       200:
 *         description: Survey details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 survey:
 *                   $ref: '#/components/schemas/Survey'
 *       404:
 *         description: Survey not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /surveys/{surveyId}/share:
 *   post:
 *     summary: Share survey with users
 *     description: Grant access to the survey for specified admin users. Requires ADMIN role.
 *     tags: [Surveys]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *       - $ref: '#/components/parameters/userRole'
 *       - in: path
 *         name: surveyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The survey ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of user IDs to share with
 *           example:
 *             userIds: [2, 3]
 *     responses:
 *       200:
 *         description: Survey access shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - invalid user IDs or non-admin users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Survey not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /surveys/{surveyId}/questions:
 *   post:
 *     summary: Add questions to a survey
 *     description: Add new questions to an existing survey. Requires ADMIN role.
 *     tags: [Questions]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *       - $ref: '#/components/parameters/userRole'
 *       - in: path
 *         name: surveyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The survey ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questions
 *             properties:
 *               questions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/QuestionInput'
 *           example:
 *             questions:
 *               - text: Rate the product quality
 *                 type: RATING
 *                 rating_min: 1
 *                 rating_max: 10
 *     responses:
 *       200:
 *         description: Questions added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Survey not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /surveys/{surveyId}/answers:
 *   get:
 *     summary: Get user's answers for a survey
 *     description: Get the current user's answers for a specific survey. Requires ANSWERER role.
 *     tags: [Answers]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *       - $ref: '#/components/parameters/userRole'
 *       - in: path
 *         name: surveyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The survey ID
 *     responses:
 *       200:
 *         description: User's answers for the survey
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 answers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Answer'
 *       404:
 *         description: Survey not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   post:
 *     summary: Submit answers to a survey
 *     description: Submit answers to a survey. Each answerer can only submit one set of answers per survey (upsert on conflict). Requires ANSWERER role.
 *     tags: [Answers]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *       - $ref: '#/components/parameters/userRole'
 *       - in: path
 *         name: surveyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The survey ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/AnswerInput'
 *           example:
 *             answers:
 *               - question_id: 1
 *                 value: 4
 *               - question_id: 2
 *                 value: true
 *               - question_id: 3
 *                 value: Better communication
 *     responses:
 *       200:
 *         description: Answers submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Survey not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /answers:
 *   get:
 *     summary: Get all user's answers
 *     description: Get all answers submitted by the current user across all surveys. Requires ANSWERER role.
 *     tags: [Answers]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *       - $ref: '#/components/parameters/userRole'
 *     responses:
 *       200:
 *         description: All user's answers grouped by survey
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 answers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       survey_id:
 *                         type: integer
 *                       survey_title:
 *                         type: string
 *                       answers:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Answer'
 */

/**
 * @swagger
 * /users/{userId}/surveys/{surveyId}/answers:
 *   get:
 *     summary: Get a user's answers (admin)
 *     description: Get answers submitted by a specific user for a specific survey. Requires ADMIN role.
 *     tags: [Answers]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *       - $ref: '#/components/parameters/userRole'
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *       - in: path
 *         name: surveyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The survey ID
 *     responses:
 *       200:
 *         description: User's answers for the survey
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 answers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Answer'
 *       404:
 *         description: Survey or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /statistics:
 *   get:
 *     summary: Get aggregated survey statistics
 *     description: Get aggregated statistics for all surveys including response counts, average ratings, and boolean counts. Requires ADMIN role.
 *     tags: [Statistics]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *       - $ref: '#/components/parameters/userRole'
 *     responses:
 *       200:
 *         description: Aggregated survey statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       survey_id:
 *                         type: integer
 *                       survey_title:
 *                         type: string
 *                       questions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             question_id:
 *                               type: integer
 *                             text:
 *                               type: string
 *                             type:
 *                               type: string
 *                             total_responses:
 *                               type: integer
 *                             average_rating:
 *                               type: number
 *                               nullable: true
 *                             true_count:
 *                               type: integer
 *                             false_count:
 *                               type: integer
 */
