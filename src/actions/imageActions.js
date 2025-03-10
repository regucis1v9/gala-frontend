export const SET_BUTTONS_DATA = 'SET_BUTTONS_DATA';
export const UPDATE_IMAGE_LINK = 'UPDATE_IMAGE_LINK';
export const UPDATE_IMAGE_DESCRIPTION = 'UPDATE_IMAGE_DESCRIPTION';
export const UPDATE_TEXT_COLOR = 'UPDATE_TEXT_COLOR'; 
export const UPDATE_BG_COLOR = 'UPDATE_BG_COLOR'; 
export const UPDATE_TEXT_POSITION = 'UPDATE_TEXT_POSITION';

export const setButtonsData = (buttonsData) => ({
  type: SET_BUTTONS_DATA,
  payload: buttonsData,
});

export const updateImageLink = (id, imageLink) => ({
  type: UPDATE_IMAGE_LINK,
  payload: { id, imageLink },
});

export const updateImageDescription = (id, description) => ({
  type: UPDATE_IMAGE_DESCRIPTION,
  payload: { id, description },
});

export const updateTextColor = (id, textColor) => ({
  type: UPDATE_TEXT_COLOR,
  payload: { id, textColor },
});

export const updateBgColor = (id, bgColor) => ({
  type: UPDATE_BG_COLOR,
  payload: { id, bgColor }, 
});
export const updateTextPosition = (id, textPosition) => ({
  type: UPDATE_TEXT_POSITION,
  payload: { id, textPosition }, 
});
