import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import {jwtDecode} from 'jwt-decode'; // Corrected import
import { styled, useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FrsHistoryIcon from '@mui/icons-material/History';
import FacultyEntryIcon from '@mui/icons-material/PersonAdd';
import FacultyListIcon from '@mui/icons-material/People';
import FrsEntryIcon from '@mui/icons-material/Edit';
import AdminIcon from '@mui/icons-material/SupervisorAccount';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import logo from '../../assets/images/logo1.png';
import Notification from './Notification'; // Import Notification component
import PropTypes from 'prop-types';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.mode === 'dark' ? '#121212' : 'white',
  color: theme.palette.mode === 'dark' ? '#fff' : 'black',
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: 'none',
  boxShadow: 'none',
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: 'none',
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const userMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, link: '/dashboard' },
  { text: 'FRS History', icon: <FrsHistoryIcon />, link: '/frs-history' },
];

const verticalHeadMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, link: '/head-dashboard' },
  { text: 'FRS History', icon: <FrsHistoryIcon />, link: '/vertical-history' },
  { text: 'FRS Update', icon: <FrsEntryIcon />, link: '/frs-entry' },

];

const adminMenuItems = [
  { text: 'Admin', icon: <AdminIcon />, link: '/admin' },
  { text: 'Faculty FRS', icon: <FacultyListIcon />, link: '/faculty-entry' },
  { text: 'FRS Overview',icon:<FrsHistoryIcon />, link: 'faculty-details'},
];

const hrMenuItems =[
  {text: 'Faculty FRS',icon: <FacultyListIcon /> , link:'/'},
  { text: 'FRS Overview',icon:<FrsHistoryIcon />, link: 'faculty-details'},
]

export default function Navbar({ jwtToken ,onLogout}) {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const navigate = useNavigate(); 

  const isMobile = useMediaQuery('(max-width:500px)');
  const isTablet = useMediaQuery('(max-width:1200px)');

  useEffect(() => {
    // Decode the JWT token to get the user role
    if (jwtToken) {
      try {
        const decoded = jwtDecode(jwtToken);
        setUserRole(decoded.role || ''); // Handle missing 'role' field
      } catch (error) {
        console.error('Error decoding JWT token:', error);
        setUserRole('');
      }
    }
  }, [jwtToken]);

  useEffect(() => {
    if (isMobile || isTablet) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile, isTablet]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const themeToggle = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#1976d2',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#f50057',
      },
    },
  });
  const handleLogout = () => {
    // Clear the token from localStorage
  onLogout();
  };

  const iconTooltips = {
    darkMode: darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode',
    notifications: 'Notifications',
    profile: 'Profile',
  };

  const renderMenuItems = (items) =>
    items.map((item, index) => (
      <ListItem key={index} disablePadding sx={{ display: 'block', py: 1 }}>
        <ListItemButton
          component={Link}
          to={item.link}
          sx={{
            minHeight: 48,
            justifyContent: open ? 'initial' : 'center',
            px: 2.5,
            color: theme.palette.mode === 'dark' ? '#fff' : '#616161',
            '&:hover': {
              color: theme.palette.mode === 'dark' ? '#90caf9' : '#1e90ff',
              marginLeft: '8px',
              marginRight: '8px',
              borderRadius: '10px',
              '& .MuiListItemIcon-root': {
                color: theme.palette.mode === 'dark' ? '#90caf9' : '#1e90ff',
              },
              '& .MuiListItemText-primary': {
                fontWeight: 'bold',
                color: theme.palette.mode === 'dark' ? '#90caf9' : '#1e90ff',
              },
            },
          
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 2 : 'auto',
              justifyContent: 'center',
              color: theme.palette.mode === 'dark' ? '#fff' : '#616161',
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            sx={{
              opacity: open ? 1 : 0,
              color: theme.palette.mode === 'dark' ? '#fff' : '#616161',
              '& .MuiTypography-root': {
                fontWeight: 'bold',
              },
            }}
          />
        </ListItemButton>
      </ListItem>
    ));

  return (
    <ThemeProvider theme={themeToggle}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar>
            {!open && (
              <>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  edge="start"
                  sx={{
                    marginRight: 5,
                    color: theme.palette.mode === 'dark' ? '#fff' : '#616161',
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{
                    fontWeight: 'bold',
                    letterSpacing: '0.3em',
                    color: theme.palette.mode === 'dark' ? '#90caf9' : '#1e90ff',
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  Worklog
                </Typography>
              </>
            )}
            <Box sx={{ flexGrow: 1 }} />
            {/* <Tooltip title={iconTooltips.darkMode}>
              <IconButton color="inherit" onClick={handleToggleTheme}>
                {darkMode ? <WbSunnyIcon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={iconTooltips.notifications}>
              <IconButton color="inherit" onClick={handleNotificationClick}>
                <NotificationsIcon />
              </IconButton>
            </Tooltip> */}
            <Tooltip title={iconTooltips.profile}>
              <IconButton edge="end" color="inherit" onClick={handleProfileClick}>
                <AccountCircleIcon sx={{fontSize: '30px'}}/>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {/* <MenuItem onClick={handleMenuClose}>Profile</MenuItem> */}
              <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
            </Menu>
            <Notification
              anchorEl={notificationAnchorEl}
              handleClose={handleNotificationClose}
            />
            <Popover
              open={Boolean(profileAnchorEl)}
              anchorEl={profileAnchorEl}
              onClose={handleProfileClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <Box sx={{ p: 2 }}>
                {/* <MenuItem onClick={handleMenuClose}>Profile</MenuItem> */}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Box>
            </Popover>
          </Toolbar>
        </AppBar>

        {isMobile ? (
          <SwipeableDrawer
            anchor="left"
            open={open}
            onClose={handleDrawerClose}
            onOpen={handleDrawerOpen}
          >
            <Box
              sx={{ width: drawerWidth }}
              role="presentation"
              onClick={handleDrawerClose}
              onKeyDown={handleDrawerClose}
            >
              <DrawerHeader>
                <IconButton onClick={handleDrawerClose}>
                  {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
              </DrawerHeader>
              <Divider />
              <List>
                {userRole === 'user' && renderMenuItems(userMenuItems)}
                {userRole === 'vertical_head' && renderMenuItems(verticalHeadMenuItems)}
                {userRole === 'admin' && renderMenuItems(adminMenuItems)}
                {userRole === 'hr' && renderMenuItems(hrMenuItems)}
              </List>
            </Box>
          </SwipeableDrawer>
        ) : (
          <Drawer variant="permanent" open={open}>
            <DrawerHeader>
              <img src={logo} alt="Logo" style={{ height: '40px', marginLeft: '10px' }} />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  ml: 2,
                  fontWeight: 'bold',
                  letterSpacing: '0.2em',
                  color: theme.palette.mode === 'dark' ? '#90caf9' : '#1e90ff',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                Worklog
              </Typography>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </DrawerHeader>
            <List>
              {userRole === 'user' && renderMenuItems(userMenuItems)}
              {userRole === 'vertical_head' && renderMenuItems(verticalHeadMenuItems)}
              {userRole === 'admin' && renderMenuItems(adminMenuItems)}
              {userRole === 'hr' && renderMenuItems(hrMenuItems)}
            </List>
          </Drawer>
        )}
      </Box>
    </ThemeProvider>
  );
}

Navbar.propTypes = {
  jwtToken: PropTypes.string.isRequired,
  onLogout: PropTypes.func.isRequired,
};
