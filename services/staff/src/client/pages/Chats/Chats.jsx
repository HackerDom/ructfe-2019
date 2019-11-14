import React from 'react';
import { Box, List, ListItemText, Paper, Typography } from '@material-ui/core';
import s from './Chats.css';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';

export function Chats () {
    return (
        <Box className={s.container}>
            <List className={s.chats}>
                <ListItem button className={s.chat}>
                    <img
                        src="./pictures/man.png"
                        alt="man"
                        width={50}
                        height={50}
                    />
                    <ListItemText primary="chat1" />
                </ListItem>
                <Divider />
                <ListItem button className={s.chat}>
                    <img
                        src="./pictures/girl.png"
                        alt="girl"
                        width={50}
                        height={50}
                    />
                    <ListItemText primary="chat2" />
                </ListItem>
                <Divider />
            </List>
            <Box className={s.messages}>
                <Box className={s.messagesList}>
                    <Box className={s.message}>
                        <Paper className={s.messagePaper}>
                            <Typography>
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                            </Typography>
                        </Paper>
                    </Box>
                    <Box className={s.message}>
                        <Paper className={s.messagePaper}>
                            <Typography>
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                            </Typography>
                        </Paper>
                    </Box>
                    <Box className={s.message}>
                        <Paper className={s.messagePaper}>
                            <Typography>
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                            </Typography>
                        </Paper>
                    </Box>
                    <Box className={s.message}>
                        <Paper className={s.messagePaper}>
                            <Typography>
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                            </Typography>
                        </Paper>
                    </Box>
                    <Box className={s.message}>
                        <Paper className={s.messagePaper}>
                            <Typography>
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                            </Typography>
                        </Paper>
                    </Box>
                    <Box className={s.message}>
                        <Paper className={s.messagePaper}>
                            <Typography>
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                            </Typography>
                        </Paper>
                    </Box>
                    <Box className={s.message}>
                        <Paper className={s.messagePaper}>
                            <Typography>
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                            </Typography>
                        </Paper>
                    </Box>
                    <Box className={s.message}>
                        <Paper className={s.messagePaper}>
                            <Typography>
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                                some message some message some message some message some message
                            </Typography>
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
