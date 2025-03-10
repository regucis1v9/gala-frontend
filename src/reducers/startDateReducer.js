const initialState = {
    startDate: ""
};

const startDateReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'UPDATE_START_DATE':
            // Ensure that action.payload is a valid Date object
            if (action.payload && action.payload instanceof Date) {
                return {
                    ...state,
                    startDate: new Date(Date.UTC(
                        action.payload.getFullYear(),
                        action.payload.getMonth(),
                        action.payload.getDate()
                    )).toISOString() // Convert the result to ISO string in UTC
                };
            }
            return state; // Return the unchanged state if payload is invalid
        default:
            return state;
    }
};

export default startDateReducer;
