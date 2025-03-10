import React from 'react';
import ReactDOM from 'react-dom/client';
import './style/index.scss';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import App from './AdminViews/UploadFiles';
import Upload from './AdminViews/UploadFiles';
import ViewFiles from './AdminViews/ViewFolders';
import Manage from './AdminViews/ManageScreens';
import FolderContent from './AdminViews/FolderContent';
import UserCreation from './AdminViews/UserCreation';
import UserManagment from './AdminViews/UserManagment';
import Login from './Components/Auth/Login';
import CreateSlideshow from './AdminViews/CreateSlideshow';
import ViewAllSlideshows from './AdminViews/ViewAllSlideshows';
import DisplaySlides from './Components/Screens/DisplaySlides';
import NotFound  from './Components/Mantine/NotFound';
import FolderContentUser from './UserViews/FolderContentUser';
import ViewFoldersUser from './UserViews/ViewFoldersUser';
import ViewScreensUser from './UserViews/ViewScreensUser';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Provider } from 'react-redux';
import store from './store'; 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
const root = ReactDOM.createRoot(document.getElementById('root'));

const themeOverride = {
  colors: {
    blue: ['#f0f0ff', '#d0d0ff', '#b0b0ff', '#9090ff', '#7070ff', '#5050ff', '#282262', '#18143f', '#443c8f', '#252142'],
  },
  primaryColor: 'blue', 
  globalStyles: (theme) => ({
    '*, *::before, *::after': {
      boxSizing: 'border-box',
    },
    body: {
      borderColor: theme.colors.blue[6], 
    },
    'input, button, select, textarea': {
      borderColor: theme.colors.blue[6],  
    },
    '.mantine-Button-root': {
      border: `3px solid ${theme.colors.blue[6]}`, 
    }
  }),
};

root.render(
  <MantineProvider theme={themeOverride}>
    <Notifications/>
      <Provider store={store}>
          <Router>
              <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/dashboard" element={<App />} />
                  <Route path="/dashboard/upload" element={<Upload />} />
                  <Route path="/dashboard/view" element={<ViewFiles />} />
                  <Route path="/dashboard/selectScreen" element={<Manage />} />
                  <Route path="/dashboard/folderContent/:folderName" element={<FolderContent />} />
                  <Route path="/dashboard/createUser" element={<UserCreation />} />
                  <Route path="/dashboard/viewAllUsers" element={<UserManagment />} />
                  <Route path="/dashboard/createSlideshow/" element={<CreateSlideshow />} />
                  <Route path="/dashboard/" element={<ViewAllSlideshows />} />
                  <Route path="/viewFolders" element={<ViewFoldersUser />} />
                  <Route path="/folderContent/:folderName" element={<FolderContentUser />} />
                  <Route path="/screen/:id" element={<DisplaySlides />} />
                  <Route path="*" element={<NotFound />} />
              </Routes>
          </Router>
      </Provider>
  </MantineProvider>
);
