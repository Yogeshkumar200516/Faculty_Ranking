import React from 'react';
import { Box, Typography, Popover, IconButton, Button, Divider, Grid } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  popover: {
    width: '400px',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    borderRadius: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    maxHeight: '400px',
  },
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 1,
    paddingBottom: theme.spacing(1),
  },
  notificationsContainer: {
    overflowY: 'auto',
    flexGrow: 1,
    paddingRight: theme.spacing(1),
  },
  notificationItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
  },
  gained: {
    color: theme.palette.success.main,
    fontWeight: 'bold',
  },
  loss: {
    color: theme.palette.error.main,
    fontWeight: 'bold',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing(2),
  },
}));

const Notification = ({ anchorEl, handleClose }) => {
  const classes = useStyles();

  // Dummy data for FRS notifications
  const frsNotifications = [
    { id: 1, date: '2024-06-10', status: 'Gained', verticalName: 'Vertical A' },
    { id: 2, date: '2024-06-09', status: 'Loss', verticalName: 'Vertical B' },
    { id: 3, date: '2024-06-08', status: 'Gained', verticalName: 'Vertical C' },
    { id: 4, date: '2024-06-07', status: 'Gained', verticalName: 'Vertical D' },
    { id: 5, date: '2024-06-06', status: 'Loss', verticalName: 'Vertical E' },
    { id: 6, date: '2024-06-05', status: 'Gained', verticalName: 'Vertical F' },
  ];

  const handleDeleteNotification = (id) => {
    // Implement delete notification logic
    console.log('Delete notification with id:', id);
  };

  const handleClearAllNotifications = () => {
    // Implement clear all notifications logic
    console.log('Clear all notifications');
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box className={classes.popover}>
        <Box className={classes.header}>
          <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom={2}>
            <Typography variant="h6">Notifications</Typography>
            <IconButton onClick={handleClose} color="inherit">
              <NotificationsIcon />
            </IconButton>
          </Box>
          <Divider />
        </Box>
        <Box className={classes.notificationsContainer}>
          <Grid container spacing={2}>
            {frsNotifications.map((notification) => (
              <Grid item xs={12} key={notification.id}>
                <Box className={classes.notificationItem}>
                  <Box>
                    <Typography variant="body1" className={notification.status === 'Gained' ? classes.gained : classes.loss}>
                      {notification.status === 'Gained' ? 'Gained' : 'Loss'} FRS from the {notification.verticalName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {notification.date}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleDeleteNotification(notification.id)} color="primary">
                      <DeleteIcon />
                    </IconButton>
                    <IconButton color="primary">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
        <Button onClick={handleClearAllNotifications} variant="outlined" className={classes.clearButton}>
          Clear All
        </Button>
      </Box>
    </Popover>
  );
};

export default Notification;
