/*
 * Multiple Object Tracking plugin
 */

"use strict";

jsPsych.plugins.mot = (function () {
  const plugin = {};

  plugin.info = {
    name: "mot",
    parameters: {
      mode: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Trial mode",
        default: "mot",
        description: "Type of trial, planned to support: mot, manual, mit",
      },
      response_mode: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Response mode",
        default: "cue",
        description: "How we ask and collect responses: cue, click",
      },
      manual_stages: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Ordered stage names",
        default: [],
        array: true,
        description: "Ordered stage names",
      },
      // --- arena setup ------------------------------------------------
      // info about size, time and background
      track: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Trajectory object",
        default: [],
        description:
          "The trajectory structure with time and x,y data for single trial",
      },
      track_array: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Trajectory object array",
        default: [],
        array: true,
        description:
          "The array of trajectory structures with time and x,y data for single trial",
      },
      track_index: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Index in trajectory object array",
        default: 0,
        description: "The index within track_array to select track values",
      },
      scale_factor: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Scaling factor for track coordinates",
        default: 20,
        description: "The multiplication factor for track coordinates",
      },
      targets: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Indices of target objects",
        default: [],
        array: true,
        description: "Indices of objects to be tracked",
      },
      target_identities: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Preview indices of target objects",
        default: [],
        array: true,
        description: "Preview indices for target objects in MIT",
      },
      object_count: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Number of presented objects",
        default: -1,
        description: "Number of objects to be tracked",
      },
      objects: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Indices of presented objects",
        default: [],
        array: true,
        description: "Indices of objects to be tracked",
      },
      arena_center_x: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Arena center X",
        default: -1,
        description:
          "The x-coordinate of the center of the arena (negative for client center)",
      },
      arena_center_y: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Arena center Y",
        default: -1,
        description:
          "The y-coordinate of the center of the arena (negative for client center)",
      },
      object_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Object size or diameter",
        default: 20,
        description: "The size of objects in pixels",
      },
      background_color: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Background color",
        default: "gray",
        description: "The background of the arena",
      },
      canvas_id: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Canvas tag identifier",
        default: "paper",
        description: "The identifier for canvas HTML tag",
      },
      aperture_type: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Aperture type",
        default: 0,
        description: "The type of aperture or clipping shape",
      },
      aperture_params: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Aperture parameters",
        default: [],
        array: true,
        description: "The parameters defining size of aperture",
      },
      aperture_frame_color: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Color of aperture frame",
        default: "black",
        description: "The color of the aperture frame",
      },
      // time settings
      preview_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Preview duration",
        default: 2000,
        description:
          "The preview time in milliseconds to study objects in the beginning",
      },
      feedback_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Feedback duration",
        default: 500,
        description: "The duration of feedback in milliseconds",
      },
      start_time: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Start time in the track data",
        default: 0,
        description:
          "The time corresponding to the initial configuration [in ms]",
      },
      stop_time: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Stop time in the track data",
        default: 8000,
        description:
          "The time corresponding to the terminal configuration [in ms]",
      },

      // --- cue: responding yes or no about highlighted object ------
      response_cue_index: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Index of cued target",
        default: -1,
        description: "The index of object we query in the end",
      },
      choices: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Choices",
        default: [],
        array: true,
        description:
          "The valid keys that the subject can press to indicate a response",
      },
      correct_choice: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Correct choice",
        default: [],
        array: true,
        description: "The correct keys for that trial",
      },
      allow_unselect: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: "Unselecting with mouse click allowed",
        default: true,
        description:
          "It is possible to change a click response with a second click",
      },
      // --- object bitmaps: setup -------------------------------------
      object_matrix_image: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: "Image matrix with object bitmaps",
        default: undefined,
        description: "The image matrix with possible object depictions",
      },
      object_matrix_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Number of rows and columns in image matrix",
        default: [1, 2],
        description: "The number of rows and columns in the image matrix",
      },
      // -- object bitmaps: coordinates --------------------------------
      preview_indices: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Preview indices",
        default: [],
        array: true,
        description: "Image matrix indices for preview objects",
      },
      preview_row: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Preview row",
        default: 0,
        description: "Image matrix row for preview objects",
      },
      motion_indices: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Motion indices",
        default: [],
        array: true,
        description: "Image matrix indices for objects in motion",
      },
      motion_row: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Motion row",
        default: 0,
        description: "Image matrix row for objects in motion",
      },
      question_indices: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Question indices",
        default: [],
        array: true,
        description: "Image matrix indices for objects in response phase",
      },
      question_row: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Question row",
        default: 0,
        description: "Image matrix row for objects in response phase",
      },
      feedback_correct_index: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Correct response index",
        default: [],
        description: "Image matrix index for correct answer",
      },
      feedback_incorrect_index: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Incorrect response index",
        default: [],
        description: "Image matrix index for incorrect answer",
      },
      target_code: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Target code",
        default: 1,
        description: "Default column of targets in image matrix",
      },
      distractor_code: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Distractor code",
        default: 0,
        description: "Default column of distractors in image matrix",
      },
      // --- visual settings for highlight cues -----------------------------
      response_cue_size: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: "Relative cue rectangle size",
        default: 1.5,
        description:
          "The relative size of the cue rectangle. Multiples of object size",
      },
      response_cue_line_width: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: "Line width of cue rectangle",
        default: 1,
        description: "The line width of the cue rectangle",
      },
      response_cue_color: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Color of cue rectangle",
        default: "black",
        description: "The color of the cue rectangle",
      },
      // ---- END OF PARAMETERS ----------------------------------------
      /* parameter_name: {
        type: jsPsych.plugins.parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: undefined,
      },
      parameter_name: {
        type: jsPsych.plugins.parameterType.IMAGE,
        default: undefined,
      }, */
    },
  };

  // top-level variables
  let ctx; // canvas context
  let lastPositions;
  // imported trial parameters
  let arenaCenterX;
  let arenaCenterY;
  let scaleFactor;
  let backgroundColor;
  let track; // current trial
  let nObjects;
  let mode;
  let targetIdentities;

  let changeStage;
  let stages;
  let currentStage;

  let previewTimeStarted;
  let motionTimeStarted;
  let questionTimeStarted;
  let feedbackTimeStarted;
  let stopAnimation;
  // object drawing
  let imageMatrixResizedCanvas;
  const cacheImages = true;
  let cacheReady;
  let cueIsPresent;
  let cueSize;
  let cueSize2; // cue size and its half
  let objectSize;
  let objectSize2; // object size and its half
  let ssw;
  let ssh; // source size for not cached images
  let frameRate;
  let previewIndices;
  let previewRow;
  let motionIndices;
  let motionRow;
  let questionIndices;
  let questionRow;
  let currectIndices;
  let currentRow;
  let queryIndex;
  let clearQuery = true;
  const APERTURE_NONE = 0;
  const APERTURE_CIRCULAR = 1;
  let apertureRadius;

  // responses
  let keyboardListener;
  let mouseListener;
  let responseMode;
  // Initialize object to store the response data. Default values of -1 are used if the trial times out and the subject has not pressed a valid key
  let response;
  let clickedObjects;
  let clickTimes;

  // utilities ----------------------------------------------
  function findBoundaryIndices(a, value, startWith = 0) {
    let bounds;
    if (a[0] > value) return undefined;
    if (a[a.length - 1] < value) return undefined;
    for (let i = startWith; i < a.length; i += 1) {
      if (a[i] <= value && value < a[i + 1]) {
        bounds = [i, i + 1];
        break;
      }
    }
    if (typeof bounds === "undefined") {
      console.log(`Problem, value=${value}, a.length=${a.length}`);
      console.log(a);
    }
    const ratio = (value - a[bounds[0]]) / (a[bounds[1]] - a[bounds[0]]);
    return { bounds, ratio };
  }

  function dateToMs(date) {
    return date.getSeconds() * 1000 + date.getMilliseconds();
  }

  function indexArrayToBooleanArray(indexArray, n) {
    const a = [];
    for (let i = 0; i < n; i += 1) {
      if (indexArray.includes(i)) {
        a.push(true);
      } else {
        a.push(false);
      }
    }
    return a;
  }

  function booleanArrayToIndexArray(boolArray) {
    const a = [];
    for (let i = 0; i < boolArray.length; i += 1) {
      if (boolArray[i]) {
        a.push(i);
      }
    }
    return a;
  }

  function integerSequence(fromIndex, toIndex) {
    // both bounds included
    const a = [];
    for (let i = fromIndex; i <= toIndex; i += 1) {
      a.push(i);
    }
    return a;
  }
  // end of utilities ---------------------------------

  plugin.trial = function (displayElement, trial) {
    // process input parameters
    arenaCenterX = trial.arena_center_x;
    arenaCenterY = trial.arena_center_y;
    objectSize2 = Math.floor(trial.object_size / 2);
    objectSize = objectSize2 * 2;
    scaleFactor = trial.scale_factor;
    backgroundColor = trial.background_color;
    cueSize2 = Math.floor((trial.object_size * trial.response_cue_size) / 2);
    cueSize = cueSize2 * 2;
    frameRate = [];
    responseMode = trial.response_mode.toLowerCase();
    previewIndices = [];
    previewRow = 0;
    motionIndices = [];
    motionRow = 0;
    questionIndices = [];
    questionRow = 0;
    currectIndices = [];
    currentRow = 0;
    cueIsPresent = [];
    previewTimeStarted = undefined;
    motionTimeStarted = undefined;
    questionTimeStarted = undefined;
    feedbackTimeStarted = undefined;

    trial.track = trial.track_array[trial.track_index];
    changeStage = false;
    stages = trial.manual_stages;
    if (stages.length === 0) {
      stages = ["preview", "motion", "question", "feedback", "finished"];
    }
    stages.push("finished"); // make sure there is the FINISHED block
    currentStage = -1;

    lastPositions = [];
    response = {
      rt: -1,
      key: -1,
    };
    clickedObjects = [];
    clickTimes = [];
    mouseListener = false;

    if (trial.objects.length === 0) {
      if (trial.object_count > 0) {
        // object array not provided, but count yes
        nObjects = trial.object_count;
      } else {
        // neither object array or count provided
        nObjects = trial.track.objects.length;
      }
      track = trial.track;
    } else {
      // we ignore object count if object indices provided
      const newTrack = { time: trial.track.time, objects: [] };
      for (let i = 0; i < trial.objects.length; i += 1) {
        // reorder based on indices
        newTrack.objects.push(trial.track.objects[trial.objects[i]]);
      }
      track = newTrack;
      nObjects = trial.objects.length;
    }
    targetIdentities = trial.target_identities;
    if (targetIdentities.length === 0) {
      targetIdentities = integerSequence(1, nObjects);
    }

    mode = trial.mode.toLowerCase();
    previewRow = trial.preview_row;
    previewIndices = trial.preview_indices;
    motionRow = trial.motion_row;
    motionIndices = trial.motion_indices;
    questionRow = trial.question_row;
    questionIndices = trial.question_indices;

    if (trial.object_matrix_size[0] === 1) {
      // only one row
      previewRow = 0;
      motionRow = 0;
      questionRow = 0;
    }
    if (mode === "mot") {
      if (previewIndices.length === 0) {
        previewIndices = [];
        for (let i = 0; i < nObjects; i += 1) {
          if (trial.targets.includes(i)) {
            previewIndices.push(trial.target_code); // default target
          } else {
            previewIndices.push(trial.distractor_code); // default distractor
          }
        }
      }
      if (motionIndices.length === 0) {
        motionIndices = [];
        for (let i = 0; i < nObjects; i += 1) {
          motionIndices.push(trial.distractor_code); // default distractor
        }
      }
      if (questionIndices.length === 0) {
        questionIndices = [];
        for (let i = 0; i < nObjects; i += 1) {
          questionIndices.push(trial.distractor_code); // default distractor
        }
      }
    }
    if (mode === "mit") {
      if (previewIndices.length === 0) {
        previewIndices = [];
        // first make everything distractors
        for (let i = 0; i < nObjects; i += 1) {
          previewIndices.push(trial.distractor_code);
        }
        // then check individual targets
        for (let i = 0; i < trial.targets.length; i += 1) {
          previewIndices[trial.targets[i]] = targetIdentities[i];
        }
      }
      if (motionIndices.length === 0) {
        motionIndices = [];
        for (let i = 0; i < nObjects; i += 1) {
          motionIndices.push(trial.distractor_code); // default distractor
        }
      }
      if (questionIndices.length === 0) {
        questionIndices = [];
        for (let i = 0; i < nObjects; i += 1) {
          questionIndices.push(trial.distractor_code); // default distractor
        }
      }
    }
    if (trial.aperture_type === APERTURE_CIRCULAR) {
      apertureRadius = trial.aperture_params;
    }

    // preparation
    displayElement.innerHTML = `<canvas id="${trial.canvas_id}"></canvas>`;
    const canvas = document.getElementById(trial.canvas_id);
    // is there a progressbar?
    const pbElement = document.getElementById("jspsych-progressbar-container");
    let pbHeight = 0;
    if (pbElement !== null) {
      pbHeight = pbElement.offsetHeight;
    }

    // Save the current settings to be restored later
    const originalMargin = displayElement.style.margin;
    const originalPadding = displayElement.style.padding;
    const originalBackgroundColor = displayElement.style.backgroundColor;

    // Remove the margins and paddings of the display_element
    //XXX displayElement.style.margin = 0;//XXX
    //XXX displayElement.style.padding = 0;//XXX
    // Match the background of the display element to the background color of the canvas so that the removal of the canvas at the end of the trial is not noticed
    displayElement.style.backgroundColor = backgroundColor;

    // Remove the margins and padding of the canvas
    //XXXcanvas.style.margin = 0;//XXX
    //XXXcanvas.style.padding = 0;//XXX

    // Get the context of the canvas so that it can be painted on.
    ctx = canvas.getContext("2d");

    // Declare variables for width and height, and also set the canvas width and height to the window width and height
    canvas.width = 2 * 320;  //XXXwindow.innerWidth - 0;
    canvas.height = 2 * 320;  //XXXwindow.innerHeight - pbHeight;

    // Set the canvas background color
    canvas.style.backgroundColor = backgroundColor;
    // Also fill the canvas otherwise you can see paths when you view image separately
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fill();

    // adjust center to client area
    if (arenaCenterX < 0) {
      arenaCenterX = Math.floor(canvas.width / 2);
    }
    if (arenaCenterY) {
      arenaCenterY = Math.floor(canvas.height / 2);
    }

    // prepare object pictures
    const imageMatrix = new Image();
    imageMatrix.src = trial.object_matrix_image;
    cacheReady = false;
    imageMatrix.addEventListener(
      "load",
      () => {
        // width, height
        const w = trial.object_size * trial.object_matrix_size[1];
        const h = trial.object_size * trial.object_matrix_size[0];
        ssw = Math.floor(imageMatrix.width / trial.object_matrix_size[1]);
        ssh = Math.floor(imageMatrix.height / trial.object_matrix_size[0]);

        imageMatrixResizedCanvas = document.createElement("canvas");
        imageMatrixResizedCanvas.height = h;
        imageMatrixResizedCanvas.width = w;
        const ctxr = imageMatrixResizedCanvas.getContext("2d");
        ctxr.drawImage(imageMatrix, 0, 0, w, h);
        cacheReady = true;
      },
      false
    );
    // end of setup
    // the only remaining part is previewAndAnimate() call, but we need some
    // functions for that

    // trial functions ------------------------------------------------
    function checkIfCorrect() {
      if (typeof trial.correct_choice !== "undefined") {
        if (
          typeof trial.correct_choice === "string" ||
          trial.correct_choice instanceof String
        ) {
          // Return true if the user's response matches the correct answer. Return false otherwise.
          return (
            response.key === trial.correct_choice.toUpperCase().charCodeAt(0)
          );
        }
        // Else if the element is a number (javascript character codes)
        if (typeof trial.correct_choice === "number") {
          console.log(response.key === trial.correct_choice);
          return response.key === trial.correct_choice;
        }
      }
      return false;
    }

    function responseFinished() {
      stopCollectingResponses();
      changeStage = true; // stage = FEEDBACK;
    }

    function afterClickingObject(objectIndex) {
      if (mode === "mit" || !trial.allow_unselect) {
        // only select the unclicked
        if (cueIsPresent[objectIndex]) {
          return;
        }
      }

      cueIsPresent[objectIndex] = !cueIsPresent[objectIndex];
      const timeNow = new Date().getTime();
      const rt = timeNow - questionTimeStarted;
      clickedObjects.push(objectIndex);
      clickTimes.push(rt);
      const numberOfSelected = cueIsPresent.reduce(
        (accumulator, currentValue) => accumulator + currentValue
      );
      if (numberOfSelected >= trial.targets.length) {
        responseFinished();
      }
      if (queryIndex > -1) {
        queryIndex = numberOfSelected;
      }
    }
    function startKeyboardListener() {
      // Start the response listener if there are choices for keys
      if (trial.choices !== jsPsych.NO_KEYS) {
        // Create the keyboard listener to listen for subjects' key response
        keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: afterKeyboardResponse, // Function to call once the subject presses a valid key
          valid_responses: trial.choices, // The keys that will be considered a valid response and cause the callback function to be called
          rt_method: "performance", // The type of method to record timing information.
          persist: false, // If set to false, keyboard listener will only trigger the first time a valid key is pressed. If set to true, it has to be explicitly cancelled by the cancelKeyboardResponse plugin API.
          allow_held_key: false, // Only register the key once, after this getKeyboardResponse function is called. (Check JsPsych docs for better info under 'jsPsych.pluginAPI.getKeyboardResponse').
        });
      }
    }
    function startMouseListener() {
      displayElement.addEventListener("mouseup", clickObjectsListener);
      mouseListener = true;
    }

    function clickObjectsListener(e) {
      const cx = e.offsetX;
      const cy = e.offsetY;
      const distances = [];
      const clicked = [];
      if (lastPositions) {
        for (let i = 0; i < nObjects; i += 1) {
          const dd = Math.sqrt(
            (cx - lastPositions[i].xx) * (cx - lastPositions[i].xx) +
            (cy - lastPositions[i].yy) * (cy - lastPositions[i].yy)
          );
          distances.push(dd);
          if (dd <= objectSize2) {
            clicked.push(i);
          }
        }
        if (clicked.length === 1) {
          afterClickingObject(clicked[0]);
        }
        if (clicked.length > 1) {
          // clicked more objects, find minimum
          let j = 0;
          for (
            let i = 0, mval = Number.MAX_VALUE, v1;
            i < clicked.length;
            i += 1
          ) {
            v1 = distances[clicked[i]];
            if (v1 < mval) {
              j = i;
              mval = v1;
            }
          }
          afterClickingObject(clicked[j]);
        }
      }
    }

    function stopCollectingResponses() {
      // Kill the keyboard listener if keyboardListener has been defined
      if (responseMode === "cue") {
        if (typeof keyboardListener !== "undefined") {
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }
      }
      if (responseMode === "click") {
        if (mouseListener) {
          displayElement.removeEventListener("mouseup", clickObjectsListener);
          mouseListener = false;
        }
      }
    }

    function endTrial() {
      let ifi;
      stopAnimation = true;
      jsPsych.pluginAPI.clearAllTimeouts();
      displayElement.innerHTML = "";
      stopCollectingResponses();

      // Restore the settings to JsPsych defaults
      displayElement.style.margin = originalMargin;
      displayElement.style.padding = originalPadding;
      displayElement.style.backgroundColor = originalBackgroundColor;

      if (frameRate) {
        ifi =
          frameRate.reduce((total, current) => total + current, 0) /
          frameRate.length;
      } else {
        ifi = 0;
      }
      const ifiSorted = frameRate.sort((a, b) => b - a);
      const excludedParams = ["track_array", "track"];
      const exportedParameters = {};

      /* for (const key in Object.keys(trial)) {
        if (!excludedParams.includes(key)) {
          exportedParameters[key] = trial[key];
        }
      } */
      for (var key in trial) {
        if (!excludedParams.includes(key)) {
          exportedParameters[key] = trial[key];
        }
      }
      var declaredTargets = trial["targets"];
      var selectedObjects = booleanArrayToIndexArray(cueIsPresent);
      // console.log(declaredTargets);
      // console.log(selectedObjects);
      var score = 0;
      for (let i = 0; i < declaredTargets.length; i++) {
        let tgt = declaredTargets[i];
        // console.log(tgt)
        if (selectedObjects.includes(Number(tgt))) {
          // console.log("yes")
          score += 1;
        }
      }

      // data saving
      const trialData = {
        rt: response.rt,
        response_key: response.key,
        correct: checkIfCorrect(),
        ifi: ifi,
        ifi_longest5: ifiSorted.slice(0, 5),
        clicked_objects: clickedObjects,
        selected_objects: booleanArrayToIndexArray(cueIsPresent),
        click_times: clickTimes,
        score: score,
        parameters: exportedParameters,
      };

      // end trial
      jsPsych.finishTrial(trialData);
    }
    function activateAperture() {
      // clipping
      ctx.save();
      if (trial.aperture_type === APERTURE_CIRCULAR) {
        ctx.beginPath();
        ctx.arc(
          arenaCenterX,
          arenaCenterY,
          apertureRadius * scaleFactor,
          0,
          2 * Math.PI
        );
        ctx.clip();
      }
    }
    function deactivateAperture() {
      if (trial.aperture_type !== APERTURE_NONE) {
        ctx.restore();
      }
    }
    function drawFrame(time, clearCues, drawAperture, query) {
      function drawObject(context, index, row, x, y) {
        // console.log(`${context} ${index} ${row}, x = ${x}, y = ${y}`);
        if (cacheImages && cacheReady) {
          // if not cacheReady, imageMatrixResizedCanvas is null, we should default to
          // non-cached version
          context.drawImage(
            imageMatrixResizedCanvas,
            // source
            index * objectSize,
            row * objectSize,
            objectSize,
            objectSize,
            // destination
            x - objectSize2,
            y - objectSize2,
            objectSize,
            objectSize
          );
        } else {
          context.drawImage(
            imageMatrix,
            // source
            index * ssw,
            row * ssh,
            ssw,
            ssh,
            // destination
            x - objectSize2,
            y - objectSize2,
            objectSize,
            objectSize
          );
        }
      }
      // expect time in milliseconds
      const lw = trial.response_cue_line_width;
      if (typeof time === "undefined") {
        // console.log(`index ${trial.track_index} stage ${currentStage}`);
        return;
      }
      // draw time
      /*
      ctx.fillStyle = "#FFF";
      ctx.fillRect(0, 0, 100, 30);
      ctx.fillStyle = "#000";
      ctx.fillText(time, 25, 25);
      */

      // clear previous MOT
      ctx.fillStyle = backgroundColor;
      while (lastPositions.length > 0) {
        const p = lastPositions.pop();
        if (clearCues) {
          ctx.fillRect(
            p.xx - cueSize2 - lw,
            p.yy - cueSize2 - lw,
            cueSize + 2 * lw,
            cueSize + 2 * lw
          );
        } else {
          ctx.fillRect(
            p.xx - objectSize2,
            p.yy - objectSize2,
            objectSize,
            objectSize
          );
        }
      }
      lastPositions = [];
      // calculate index
      const start = 0;
      let x;
      let y;
      let xx;
      let yy;
      // frame
      if (trial.aperture_type === APERTURE_CIRCULAR) {
        // start ugly hack
        /* ctx.strokeStyle = "#707070";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
          arenaCenterX,
          arenaCenterY,
          12 * scaleFactor + 1,
          0,
          2 * Math.PI
        );
        ctx.stroke(); */
        // end ugly hack
        if (trial.aperture_frame_color) {
          ctx.strokeStyle = trial.aperture_frame_color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(
            arenaCenterX,
            arenaCenterY,
            apertureRadius * scaleFactor + 1,
            0,
            2 * Math.PI
          );
          ctx.stroke();
        }
      }
      if (drawAperture) {
        activateAperture();
      }
      // set cue style
      ctx.strokeStyle = trial.response_cue_color;
      ctx.lineWidth = lw;
      // find the time position for later interpolation
      if (!Number.isFinite(time)) {
        console.log(lastPositions);
      }
      const b = findBoundaryIndices(track.time, time / 1000, start);
      // time is within track.time
      if (typeof b === "undefined") {
        console.log(`Time ${time} of `);
      } else {
        for (let i = 0; i < nObjects; i += 1) {
          x =
            track.objects[i].x[b.bounds[0]] +
            b.ratio *
            (track.objects[i].x[b.bounds[1]] -
              track.objects[i].x[b.bounds[0]]);
          y =
            track.objects[i].y[b.bounds[0]] +
            b.ratio *
            (track.objects[i].y[b.bounds[1]] -
              track.objects[i].y[b.bounds[0]]);
          xx = Math.floor(arenaCenterX + scaleFactor * x);
          yy = Math.floor(arenaCenterY + scaleFactor * y);
          lastPositions.push({ xx, yy });
          // draw object
          drawObject(ctx, currectIndices[i], currentRow, xx, yy);

          // draw cue
          if (cueIsPresent[i]) {
            ctx.strokeRect(xx - cueSize2, yy - cueSize2, cueSize, cueSize);
          }
        }
      }
      if (query > -1) {
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          arenaCenterX - cueSize2 - scaleFactor * 12,
          arenaCenterY - cueSize2 - scaleFactor * 12,
          cueSize,
          cueSize
        );
        ctx.setLineDash([]);
        drawObject(
          ctx,
          targetIdentities[query],
          previewRow,
          arenaCenterX - scaleFactor * 12,
          arenaCenterY - scaleFactor * 12
        );
      }
      if (clearQuery) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(
          arenaCenterX - cueSize2 - scaleFactor * 12 - lw,
          arenaCenterY - cueSize2 - scaleFactor * 12 - lw,
          cueSize + 2 * lw,
          cueSize + 2 * lw
        );
        clearQuery = false;
      }
      if (drawAperture) {
        deactivateAperture();
      }
    } // end of drawFrame()

    function previewAndAnimate() {
      stopAnimation = false;
      let timePrevious;
      let frameDuration;
      const noCues = indexArrayToBooleanArray([], nObjects);
      currentRow = previewRow;
      currectIndices = previewIndices;
      let clearCueFrames = false;
      let drawAperture = true;
      queryIndex = -1;
      let requestID;
      // default stages = ["preview", "motion", "question", "feedback", "finished"];
      currentStage = -1;

      function draw() {
        const timeNow = new Date().getTime();
        let timeToDraw;
        const stageSteps = {
          preview: {
            onStart: () => {
              previewTimeStarted = timeNow;
              currentRow = previewRow;
              currectIndices = previewIndices;
              timeToDraw = trial.start_time;
              cueIsPresent = noCues;
              drawAperture = true;
            },
            onFinish: () => { },
          },
          motion: {
            onStart: () => {
              //document.getElementById('nocursor')
              canvas.style.cursor = 'none';
              motionTimeStarted = timeNow;
              cueIsPresent = noCues;
              currentRow = motionRow;
              currectIndices = motionIndices;
            },
            onFinish: () => { canvas.style.cursor = 'auto'; },
          },
          question: {
            onStart: () => {
              questionTimeStarted = timeNow;
              currentRow = questionRow;
              currectIndices = [...questionIndices]; // make copy
              clearCueFrames = true;
              drawAperture = false;

              cueIsPresent = indexArrayToBooleanArray(
                [trial.response_cue_index],
                nObjects
              );
              // start listeners
              if (responseMode === "cue") {
                startKeyboardListener();
              }
              if (responseMode === "click") {
                if (mode === "mit") {
                  queryIndex = 0;
                }
                startMouseListener();
              }
            },
            onFinish: () => { },
          },
          feedback: {
            onStart: () => {
              feedbackTimeStarted = timeNow;
              currentRow = questionRow;
              currectIndices = [...questionIndices]; // make copy
              if (queryIndex > -1) {
                queryIndex = -1;
                clearQuery = true;
              }
              // mode 1) clicking mot ---------------------------------
              if (responseMode === "click" && mode === "mot") {
                for (let i = 0; i < nObjects; i += 1) {
                  // mouse selected
                  if (cueIsPresent[i] && trial.targets.includes(i)) {
                    if (trial.feedback_correct_index >= 0) {
                      currectIndices[i] = trial.feedback_correct_index;
                    }
                  }
                  if (cueIsPresent[i] && !trial.targets.includes(i)) {
                    if (trial.feedback_incorrect_index >= 0) {
                      currectIndices[i] = trial.feedback_incorrect_index;
                    }
                  }
                }
              }
              // mode 2) clicking MIT ---------------------------------
              if (responseMode === "click" && mode === "mit") {
                currectIndices = [];
                // first make everything distractors
                for (let i = 0; i < nObjects; i += 1) {
                  currectIndices.push(trial.distractor_code);
                }
                // then check individual targets
                for (let i = 0; i < trial.targets.length; i += 1) {
                  currectIndices[trial.targets[i]] = targetIdentities[i];
                }
                for (let i = 0; i < trial.targets.length; i += 1) {
                  if (trial.targets[i] !== clickedObjects[i]) {
                    currectIndices[clickedObjects[i]] =
                      trial.feedback_incorrect_index;
                  }
                  // console.log(`${trial.targets[i]} .. ${clickedObjects[i]}`);
                }
              }
              // mode 3) cue yes/no, both MOT/MIT ---------------------
              if (responseMode === "cue") {
                const ok = checkIfCorrect();
                if (ok) {
                  if (trial.feedback_correct_index >= 0) {
                    currectIndices[trial.response_cue_index] =
                      trial.feedback_correct_index;
                  }
                } else if (trial.feedback_incorrect_index >= 0) {
                  currectIndices[trial.response_cue_index] =
                    trial.feedback_incorrect_index;
                }
              }
              // mode 4) show correct responses
              if (
                trial.feedback_correct_index < 0 &&
                trial.feedback_incorrect_index
              ) {
                currentRow = previewRow;
                currectIndices = previewIndices;
              }
            },
            onFinish: () => { },
          },
          finished: {
            onStart: () => { },
            onFinish: () => { },
          },
        };
        if (currentStage === -1) {
          currentStage = 0;
          stageSteps[stages[currentStage]].onStart();
        }
        // every frame in PREVIEW
        if (stages[currentStage] === "preview") {
          if (timeNow - previewTimeStarted > trial.preview_duration) {
            changeStage = true;
          } else {
            timeToDraw = trial.start_time;
          }
        }
        // every frame in MOTION
        if (stages[currentStage] === "motion") {
          const t = timeNow - motionTimeStarted;
          if (!Number.isNaN(timePrevious)) {
            frameDuration = timeNow - timePrevious;
            frameRate.push(frameDuration);
          }
          if (t > trial.stop_time - trial.start_time) {
            changeStage = true;
          }
          timeToDraw = t + trial.start_time;
        }
        // every frame in QUESTION
        if (stages[currentStage] === "question") {
          const t = timeNow - questionTimeStarted;
          /* if (t > 1000) {
            responseTime = t;
            stage = FINISHED;
          } */
          timeToDraw = trial.stop_time;
        }
        // every frame in FEEDBACK
        if (stages[currentStage] === "feedback") {
          if (timeNow - feedbackTimeStarted >= trial.feedback_duration) {
            changeStage = true;
          }
          timeToDraw = trial.stop_time;
        }

        if (changeStage) {
          stageSteps[stages[currentStage]].onFinish();
          currentStage += 1;
          stageSteps[stages[currentStage]].onStart();
          changeStage = false;
        }

        if (stages[currentStage] === "finished") {
          stopAnimation = true;
          window.cancelAnimationFrame(requestID);
          endTrial();
          return;
        }
        if (stopAnimation) {
          // cancel request - normal trial should not reach this line but stage == FINISHED above
          window.cancelAnimationFrame(requestID);
        } else {
          requestID = window.requestAnimationFrame(draw);
        }
        drawFrame(timeToDraw, clearCueFrames, drawAperture, queryIndex);
        timePrevious = timeNow;
      } // end of draw()

      requestID = window.requestAnimationFrame(draw);
    } // end of previewAndAnimate()

    function afterKeyboardResponse(info) {
      if (response.key === -1) {
        response = info; // Replace the response object created above
      }
      responseFinished();
    }
    // setup and functions prepared, just preview and animate
    previewAndAnimate();
  }; // end of plugin.trial(displayElement, trial) definition
  return plugin;
})();
