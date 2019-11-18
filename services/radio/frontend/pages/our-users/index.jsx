import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { fetchOurUsers } from '../../actions/ourUsers/actions';
import Layout from '../../layouts/layout';


class OurUsersPage extends React.Component {
    static propTypes = {
        fetchOurUsers: PropTypes.func,
        ourUsers: PropTypes.arrayOf(PropTypes.string),
    }

    componentDidMount() {
        const { fetchOurUsers } = this.props;
        fetchOurUsers();
    }

    render() {
        const { ourUsers } = this.props;
        return <Layout>
            <div className='our-user'>
                <div className='our-user__title'>Our users:</div>
                <div className='our-user-list'>
                    {ourUsers.map((username) => <div key={`our-user-${username}`}
                        className='our-user-list__username'>
                        {username}
                    </div>)}
                </div>
            </div>
        </Layout>;
    }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
    fetchOurUsers
}, dispatch);
const mapStateToProps = (state) => ({
    ourUsers: state.ourUsers.users
});

export default connect(mapStateToProps, mapDispatchToProps)(OurUsersPage);
