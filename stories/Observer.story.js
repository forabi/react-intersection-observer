// @flow
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import Observer from '../src/index'
import ScrollWrapper from './ScrollWrapper'
import RootComponent from './Root'

type Props = {
  style?: Object,
  children?: React.Node,
}

const Header = (props: Props) => (
  <div
    style={{
      display: 'flex',
      minHeight: '25vh',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      background: 'lightcoral',
      color: 'azure',
      ...props.style,
    }}
  >
    <h2>{props.children}</h2>
  </div>
)

storiesOf('Intersection Observer', module)
  .add('Child as function', () => (
    <ScrollWrapper>
      <Observer onChange={action('Child Observer inview')}>
        {inView => (
          <Header>{`Header inside viewport: ${inView.toString()}`}</Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
  .add('With threshold 100%', () => (
    <ScrollWrapper>
      <Observer threshold={1} onChange={action('Child Observer inview')}>
        {inView => (
          <Header
          >{`Header is fully inside the viewport: ${inView.toString()}`}</Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
  .add('With threshold 50%', () => (
    <ScrollWrapper>
      <Observer threshold={0.5} onChange={action('Child Observer inview')}>
        {inView => (
          <Header
          >{`Header is 50% inside the viewport: ${inView.toString()}`}</Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
  .add('With threshold array', () => (
    <ScrollWrapper>
      <Observer
        threshold={[0, 0.25, 0.5, 0.75, 1]}
        onChange={action('Hit threshold trigger')}
      >
        {inView => (
          <Header
          >{`Header is inside threshold: ${inView.toString()} - onChange triggers multiple times.`}</Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
  .add('With root', () => (
    <RootComponent>
      {node => (
        <ScrollWrapper>
          <Observer
            threshold={0}
            root={node}
            rootMargin="64px"
            rootId="window1"
            onChange={action('Child Observer inview')}
          >
            {inView => (
              <Header
              >{`Header is inside the root viewport: ${inView.toString()}`}</Header>
            )}
          </Observer>
        </ScrollWrapper>
      )}
    </RootComponent>
  ))
  .add('With root and rootMargin', () => (
    <RootComponent style={{ padding: 64 }}>
      {node => (
        <ScrollWrapper>
          <Observer
            threshold={0}
            root={node}
            rootMargin="64px"
            rootId="window2"
            onChange={action('Child Observer inview')}
          >
            {inView => (
              <Header
              >{`Header is inside the root viewport: ${inView.toString()}`}</Header>
            )}
          </Observer>
        </ScrollWrapper>
      )}
    </RootComponent>
  ))
  .add('Trigger once', () => (
    <ScrollWrapper>
      <Observer
        threshold={1}
        triggerOnce
        onChange={action('Child Observer inview')}
      >
        {inView => (
          <Header
          >{`Header was fully inside the viewport: ${inView.toString()}`}</Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
  .add('Multiple observers', () => (
    <ScrollWrapper>
      <Observer threshold={1} onChange={action('Child Observer inview')}>
        {inView => (
          <Header
          >{`Header 1 is fully inside the viewport: ${inView.toString()}`}</Header>
        )}
      </Observer>
      <Observer threshold={1} onChange={action('Child Observer inview')}>
        {inView => (
          <Header
          >{`Header 2 is fully inside the viewport: ${inView.toString()}`}</Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
  .add('Render method', () => (
    <ScrollWrapper>
      <Observer
        style={{ height: 200, position: 'relative' }}
        onChange={action('Render Observer inview')}
        render={() => (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <Header style={{ minHeight: '0', height: '100%' }}>
              Header is only rendered once observer is in view. Make sure that
              the Observer controls the height, so it does not change.
            </Header>
          </div>
        )}
      />
    </ScrollWrapper>
  ))
  .add('Plain child', () => (
    <ScrollWrapper>
      <Observer onChange={action('Plain Observer inview')}>
        <Header>
          Plain children are always rendered. Use onChange to monitor state.
        </Header>
      </Observer>
    </ScrollWrapper>
  ))
