/* eslint-disable react/prop-types */
import { mocked } from 'ts-jest/utils';
import React from 'react';
import {
  render,
  fireEvent,
  waitForElement,
  wait,
  RenderResult,
} from '@testing-library/react';
import {
  TAddNotificationAction,
  ADD_NOTIFICATION,
} from '@commercetools-frontend/notifications';
import {
  NOTIFICATION_DOMAINS,
  NOTIFICATION_KINDS_SIDE,
} from '@commercetools-frontend/constants';
import {
  useShowNotification,
  TShowNotification,
} from '@commercetools-frontend/actions-global';
import Notifier from './notifier';

jest.mock('@commercetools-frontend/actions-global');

type TextControllerProps = {
  children: React.ReactNode;
};
const TestController = (props: TextControllerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  // This is just to test a rendering of the children
  const [counter, setCounter] = React.useState(0);

  return (
    <div>
      <p>{`Count: ${counter}`}</p>
      <button onClick={() => setCounter(counter + 1)}>
        {'Increase counter'}
      </button>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Close' : 'Open'}
      </button>
      {isOpen && props.children}
    </div>
  );
};

describe('rendering', () => {
  let rendered: RenderResult;
  let dismiss: () => void;
  let showNotification: (
    notification: TShowNotification
  ) => TAddNotificationAction<Pick<TShowNotification, 'id'>>;
  beforeEach(() => {
    dismiss = jest.fn();
    showNotification = jest.fn(() => ({
      type: ADD_NOTIFICATION,
      payload: { id: 1 },
      dismiss,
    }));
    mocked(useShowNotification).mockClear();
    mocked(useShowNotification).mockReturnValue(showNotification);
  });
  it('should dispatch notification when component renders, then remove the notification when component is removed', async () => {
    rendered = render(
      <TestController>
        <Notifier
          domain={NOTIFICATION_DOMAINS.SIDE}
          kind="success"
          text="foo"
        />
      </TestController>
    );
    await waitForElement(() => rendered.getByText('Open'));
    fireEvent.click(rendered.getByText('Open'));

    await wait(() => {
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: NOTIFICATION_DOMAINS.SIDE,
          kind: NOTIFICATION_KINDS_SIDE.success,
          text: 'foo',
        }),
        undefined
      );
      expect(dismiss).not.toHaveBeenCalled();
    });

    fireEvent.click(rendered.getByText('Increase counter'));
    fireEvent.click(rendered.getByText('Increase counter'));
    fireEvent.click(rendered.getByText('Increase counter'));
    await waitForElement(() => rendered.getByText('Count: 3'));

    fireEvent.click(rendered.getByText('Close'));
    await wait(() => {
      expect(showNotification).toHaveBeenCalledTimes(1);
      expect(dismiss).toHaveBeenCalled();
    });
  });
});