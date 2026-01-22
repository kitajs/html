///<reference path="../hotwire-turbo.d.ts" />

import { describe, expect, it } from 'vitest';

describe('Turbo', () => {
  it('should return turbo frames correctly', async () => {
    expect(<turbo-frame id="messages"></turbo-frame>).toMatchInlineSnapshot(
      `"<turbo-frame id="messages"></turbo-frame>"`
    );

    expect(
      <turbo-frame id="messages">
        <a href="/messages/expanded">Show all expanded messages in this frame.</a>

        <form action="/messages">Show response from this form within this frame.</form>
      </turbo-frame>
    ).toMatchInlineSnapshot(
      `"<turbo-frame id="messages"><a href="/messages/expanded">Show all expanded messages in this frame.</a><form action="/messages">Show response from this form within this frame.</form></turbo-frame>"`
    );

    expect(
      <turbo-frame id="messages" target="_top">
        <a href="/messages/1" data-turbo-frame="_self">
          Following link will replace just this frame.
        </a>
      </turbo-frame>
    ).toMatchInlineSnapshot(
      `"<turbo-frame id="messages" target="_top"><a href="/messages/1" data-turbo-frame="_self">Following link will replace just this frame.</a></turbo-frame>"`
    );

    expect(
      <turbo-frame id="messages" data-turbo-action="advance">
        <a href="/messages?page=2" data-turbo-action="replace">
          Replace history with next page
        </a>
      </turbo-frame>
    ).toMatchInlineSnapshot(
      `"<turbo-frame id="messages" data-turbo-action="advance"><a href="/messages?page=2" data-turbo-action="replace">Replace history with next page</a></turbo-frame>"`
    );
  });

  it('should render turbo streams correctly', async () => {
    expect(
      <turbo-stream action="append" target="dom_id">
        <template>Content to append to container designated with the dom_id.</template>
      </turbo-stream>
    ).toMatchInlineSnapshot(
      `"<turbo-stream action="append" target="dom_id"><template>Content to append to container designated with the dom_id.</template></turbo-stream>"`
    );

    expect(
      <turbo-stream action="prepend" target="dom_id">
        <template>Content to prepend to container designated with the dom_id.</template>
      </turbo-stream>
    ).toMatchInlineSnapshot(
      `"<turbo-stream action="prepend" target="dom_id"><template>Content to prepend to container designated with the dom_id.</template></turbo-stream>"`
    );

    expect(
      <turbo-stream action="replace" target="dom_id">
        <template>Content to replace the element designated with the dom_id.</template>
      </turbo-stream>
    ).toMatchInlineSnapshot(
      `"<turbo-stream action="replace" target="dom_id"><template>Content to replace the element designated with the dom_id.</template></turbo-stream>"`
    );
  });
});
