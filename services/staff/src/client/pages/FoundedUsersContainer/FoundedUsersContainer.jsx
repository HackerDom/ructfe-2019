import { BorderBox } from '../../components/BorderBox/BorderBox';
import { MarginBox } from '../../components/MarginBox/MarginBox';
import { Row } from '../../components/Row/Row';
import { Text } from '../../components/Text/Text';
import { Button } from '../../components/Button/Button';
import React from 'react';
import { Switch } from '../../components/Switch/Switch';
import { Case } from '../../components/Switch/Case';

const states = {
    empty: 'empty',
    found: 'found',
    notFound: 'notFound'
};

export function FoundedUsersContainer ({ searchState, user, onGoToUser }) {
    const FORM_GAP = 110;

    return (
        <Switch by={searchState}>
            <Case value={states.found}>
                <BorderBox>
                    <MarginBox>
                        <Row gap={FORM_GAP}>
                            <Text text={'First name: '}/>
                            <Text text={user.firstName}/>
                        </Row>
                    </MarginBox>
                    <MarginBox>
                        <Row gap={FORM_GAP}>
                            <Text text={'Last name: '}/>
                            <Text text={user.lastName}/>
                        </Row>
                    </MarginBox>
                    <MarginBox>
                        <Row gap={FORM_GAP}>
                            <Text text={'Username'}/>
                            <Text text={user.username}/>
                        </Row>
                    </MarginBox>
                    <MarginBox>
                        <div>
                            <Row gap={FORM_GAP}>
                                <Text text={'Go to user: '}/>
                                <Button
                                    onClick={onGoToUser}
                                    text={user.username}/>
                            </Row>
                        </div>
                    </MarginBox>
                </BorderBox>
            </Case>
            <Case value={states.notFound}>
                <BorderBox>
                    <Text text='User was not found.'/>
                </BorderBox>
            </Case>
            <Case value={states.empty}>
                <div>
                </div>
            </Case>
        </Switch>
    );
}
