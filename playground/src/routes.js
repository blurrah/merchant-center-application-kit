import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import LockedDiamondSVG from '@commercetools-frontend/assets/images/locked-diamond.svg';
import { MaintenancePageLayout } from '@commercetools-frontend/application-components';
import { InjectReducers } from '@commercetools-frontend/application-shell';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import StateMachinesList from './components/state-machines-list';
import StateMachinesDetails from './components/state-machines-details';
import EchoServer from './components/echo-server';
import reducers from './reducers';
import { PERMISSIONS } from './constants';

const PageUnauthorized = () => (
  <MaintenancePageLayout
    imageSrc={LockedDiamondSVG}
    title="Not enough permissions to access this resource"
    paragraph1="We recommend to contact your project administrators for further questions."
  />
);

const ApplicationRoutes = (props) => {
  const canViewDeveloperSettings = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.ViewDeveloperSettings],
  });
  return (
    <InjectReducers id="state-machines" reducers={reducers}>
      <Switch>
        <Route path={`${props.match.path}/echo-server`}>
          <EchoServer />
        </Route>
        <Route
          path={`${props.match.path}/:id`}
          render={(routerProps) => {
            if (!canViewDeveloperSettings) {
              return <PageUnauthorized />;
            }
            return (
              <StateMachinesDetails
                id={routerProps.match.params.id}
                projectKey={routerProps.match.params.projectKey}
                backToListPath={props.match.url}
              />
            );
          }}
        />
        <Route
          render={() => {
            if (!canViewDeveloperSettings) {
              return <PageUnauthorized />;
            }
            return (
              <StateMachinesList
                goToStateMachineDetail={(id) => {
                  props.history.push(`${props.match.url}/${id}`);
                }}
              />
            );
          }}
        />
      </Switch>
    </InjectReducers>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';
ApplicationRoutes.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    params: PropTypes.shape({
      projectKey: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default ApplicationRoutes;
