import { ClosureComponent, Component } from 'mithril';
import { m } from '../components.ts';
import * as taskQueue from '../task-queue.ts';
import * as notifications from '../notifications.ts';
import * as store from '../store.ts';

const component: ClosureComponent = (): Component => {
    return {
        view: (vnode) => {
            const device = vnode.attrs['device'];

            const buttons = [];

            buttons.push(
                m(
                    'button.btn.btn-outline-primary',
                    {
                        title  : 'Reboot Device',
                        onclick: () => {
                            taskQueue.queueTask({name: 'reboot', device: device['DeviceID.ID'].value[0]});
                        },
                    },
                    [m('i.bi.bi-bootstrap-reboot'), m.trust('&nbsp;'), 'Reboot'],
                ),
            );

            buttons.push(
                m(
                    'button.btn.btn-outline-danger',
                    {
                        title  : 'Factory reset device',
                        onclick: () => {
                            taskQueue.queueTask({name: 'factoryReset', device: device['DeviceID.ID'].value[0]});
                        },
                    },
                    [m('i.bi.bi-x-octagon'), m.trust('&nbsp;'), 'Reset'],
                ),
            );

            buttons.push(
                m(
                    'button.btn.btn-outline-danger',
                    {
                        title  : 'Push a firmware or a config file',
                        onclick: () => {
                            taskQueue.stageDownload({name: 'download', devices: [device['DeviceID.ID'].value[0]]});
                        },
                    },
                    [m('i.bi.bi-file-earmark-arrow-up'), m.trust('&nbsp;'), 'Push File'],
                ),
            );

            buttons.push(
                m(
                    'button.btn.btn-outline-danger',
                    {
                        title  : 'Delete device',
                        onclick: () => {
                            if (!confirm('Deleting this device. Are you sure?')) return;
                            const deviceId = device['DeviceID.ID'].value[0];

                            store
                                .deleteResource('devices', deviceId)
                                .then(() => {
                                    notifications.push('success', `${deviceId}: Device Deleted!`);
                                    m.route.set('/devices');
                                })
                                .catch((err) => {
                                    notifications.push('error', err.message);
                                });
                        },
                    },
                    [m('i.bi.bi-trash'), m.trust('&nbsp;'), 'Delete'],
                ),
            );

            return m('.actions-bar', buttons)
        },
    };
};

export default component;
