import m, { ClosureComponent, Component } from 'mithril';
import * as overlay from './overlay.ts';

const component: ClosureComponent = (): Component => {
    return {
        view: (vnode) => {
            const text    = vnode.attrs['text'];
            const element = vnode.attrs['element'] || 'span';

            function overflowed(_vnode): void {
                _vnode.dom.classList.add('long-text-overflowed');
                _vnode.dom.onclick = (e: any) => {
                    overlay.open(() => {
                        return m('div', {
                                     class  : 'modal-body',
                                     onclick: (e: any) => {
                                         e.stopPropagation();
                                     },
                                 },
                                 m('textarea', {
                                     class   : 'form-control long-text',
                                     value   : text,
                                     cols    : 80,
                                     rows    : 24,
                                     readonly: true,
                                     disabled: true,
                                     oncreate: (vnode2) => {
                                         (vnode2.dom as HTMLTextAreaElement).focus();
                                         (vnode2.dom as HTMLTextAreaElement).select();
                                     },
                                 }),
                        );
                    });
                    m.redraw();
                };
            }

            return m(
                element,
                {
                    oncreate: (vnode2) => {
                        if (vnode2.dom.clientWidth !== vnode2.dom.scrollWidth)
                            overflowed(vnode2);
                    },
                    onupdate: (vnode2) => {
                        if (vnode2.dom.clientWidth === vnode2.dom.scrollWidth) {
                            (vnode2.dom as HTMLElement).classList.remove(
                                'long-text-overflowed',
                            );
                            (vnode2.dom as HTMLElement).onclick = null;
                        } else {
                            overflowed(vnode2);
                        }
                    },
                    class   : 'long-text',
                    title   : text,
                },
                text,
            );
        },
    };
};

export default component;
