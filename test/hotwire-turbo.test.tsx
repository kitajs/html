/// <reference types="../hotwire-turbo.d.ts" />
//
import assert from 'node:assert';
import { describe, it } from 'node:test';

describe('Turbo', () => {
  it('should return turbo frames correctly', async () => {
    assert.equal(
      '<turbo-frame id="messages"></turbo-frame>',
      <turbo-frame id="messages"></turbo-frame>
    );

    assert.equal(
      '<turbo-frame id="messages"><a href="/messages/expanded">Show all expanded messages in this frame.</a><form action="/messages">Show response from this form within this frame.</form></turbo-frame>',
      <turbo-frame id="messages">
        <a href="/messages/expanded">Show all expanded messages in this frame.</a>

        <form action="/messages">Show response from this form within this frame.</form>
      </turbo-frame>
    );

    assert.equal(
      '<turbo-frame id="messages" target="_top"><a href="/messages/1" data-turbo-frame="_self">Following link will replace just this frame.</a></turbo-frame>',
      <turbo-frame id="messages" target="_top">
        <a href="/messages/1" data-turbo-frame="_self">
          Following link will replace just this frame.
        </a>
      </turbo-frame>
    );

    assert.equal(
      '<turbo-frame id="messages" data-turbo-action="advance"><a href="/messages?page=2" data-turbo-action="replace">Replace history with next page</a></turbo-frame>',
      <turbo-frame id="messages" data-turbo-action="advance">
        <a href="/messages?page=2" data-turbo-action="replace">
          Replace history with next page
        </a>
      </turbo-frame>
    );
  });

  it('should render turbo streams correctly', async () => {
    assert.equal(
      '<turbo-stream action="append" target="dom_id"><template>Content to append to container designated with the dom_id.</template></turbo-stream>',
      <turbo-stream action="append" target="dom_id">
        <template>Content to append to container designated with the dom_id.</template>
      </turbo-stream>
    );

    assert.equal(
      '<turbo-stream action="prepend" target="dom_id"><template>Content to prepend to container designated with the dom_id.</template></turbo-stream>',
      <turbo-stream action="prepend" target="dom_id">
        <template>Content to prepend to container designated with the dom_id.</template>
      </turbo-stream>
    );

    assert.equal(
      '<turbo-stream action="replace" target="dom_id"><template>Content to replace the element designated with the dom_id.</template></turbo-stream>',
      <turbo-stream action="replace" target="dom_id">
        <template>Content to replace the element designated with the dom_id.</template>
      </turbo-stream>
    );
  });
});
