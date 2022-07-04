
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.22.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function createUrlStore(ssrUrl) {
      // Ideally a bundler constant so that it's tree-shakable
      if (typeof window === 'undefined') {
        const { subscribe } = writable(ssrUrl);
        return { subscribe }
      }

      const href = writable(window.location.href);

      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      const updateHref = () => href.set(window.location.href);

      history.pushState = function () {
        originalPushState.apply(this, arguments);
        updateHref();
      };

      history.replaceState = function () {
        originalReplaceState.apply(this, arguments);
        updateHref();
      };

      window.addEventListener('popstate', updateHref);
      window.addEventListener('hashchange', updateHref);

      return {
        subscribe: derived(href, ($href) => new URL($href)).subscribe
      }
    }

    // If you're using in a pure SPA, you can return a store directly and share it everywhere
    var url = createUrlStore();

    /* src\UI\Card.svelte generated by Svelte v3.22.2 */
    const file = "src\\UI\\Card.svelte";
    const get_card_body_slot_changes = dirty => ({});
    const get_card_body_slot_context = ctx => ({ class: "card-body" });
    const get_card_header_slot_changes = dirty => ({});
    const get_card_header_slot_context = ctx => ({ class: "card-header" });

    // (24:4) {#if cardImage}
    function create_if_block(ctx) {
    	let t;
    	let div;
    	let if_block = /*goBackBtn*/ ctx[2] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			div = element("div");
    			attr_dev(div, "class", "cardImg svelte-an2h17");
    			set_style(div, "background-image", "url(\"" + /*cardImage*/ ctx[0] + "\")");
    			set_style(div, "min-height", /*minImgHeight*/ ctx[1]);
    			add_location(div, file, 29, 8, 1132);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*goBackBtn*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*cardImage*/ 1) {
    				set_style(div, "background-image", "url(\"" + /*cardImage*/ ctx[0] + "\")");
    			}

    			if (dirty & /*minImgHeight*/ 2) {
    				set_style(div, "min-height", /*minImgHeight*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(24:4) {#if cardImage}",
    		ctx
    	});

    	return block;
    }

    // (25:8) {#if goBackBtn}
    function create_if_block_1(ctx) {
    	let button;
    	let svg;
    	let path;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M224 480c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25l192-192c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l169.4 169.4c12.5 12.5 12.5 32.75 0 45.25C240.4 476.9 232.2 480 224 480z");
    			add_location(path, file, 26, 258, 848);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "fill", "Gray");
    			attr_dev(svg, "viewBox", "0 0 320 512");
    			attr_dev(svg, "class", "svelte-an2h17");
    			add_location(svg, file, 26, 16, 606);
    			attr_dev(button, "class", "btn goBackBtn svelte-an2h17");
    			add_location(button, file, 25, 12, 540);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*goBack*/ ctx[3], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(25:8) {#if goBackBtn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;
    	let dispose;
    	let if_block = /*cardImage*/ ctx[0] && create_if_block(ctx);
    	const card_header_slot_template = /*$$slots*/ ctx[7]["card-header"];
    	const card_header_slot = create_slot(card_header_slot_template, ctx, /*$$scope*/ ctx[6], get_card_header_slot_context);
    	const card_body_slot_template = /*$$slots*/ ctx[7]["card-body"];
    	const card_body_slot = create_slot(card_body_slot_template, ctx, /*$$scope*/ ctx[6], get_card_body_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			if (card_header_slot) card_header_slot.c();
    			t1 = space();
    			if (card_body_slot) card_body_slot.c();
    			attr_dev(div, "class", "card svelte-an2h17");
    			add_location(div, file, 22, 0, 433);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t0);

    			if (card_header_slot) {
    				card_header_slot.m(div, null);
    			}

    			append_dev(div, t1);

    			if (card_body_slot) {
    				card_body_slot.m(div, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", /*dispatchCardClick*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*cardImage*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (card_header_slot) {
    				if (card_header_slot.p && dirty & /*$$scope*/ 64) {
    					card_header_slot.p(get_slot_context(card_header_slot_template, ctx, /*$$scope*/ ctx[6], get_card_header_slot_context), get_slot_changes(card_header_slot_template, /*$$scope*/ ctx[6], dirty, get_card_header_slot_changes));
    				}
    			}

    			if (card_body_slot) {
    				if (card_body_slot.p && dirty & /*$$scope*/ 64) {
    					card_body_slot.p(get_slot_context(card_body_slot_template, ctx, /*$$scope*/ ctx[6], get_card_body_slot_context), get_slot_changes(card_body_slot_template, /*$$scope*/ ctx[6], dirty, get_card_body_slot_changes));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card_header_slot, local);
    			transition_in(card_body_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card_header_slot, local);
    			transition_out(card_body_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (card_header_slot) card_header_slot.d(detaching);
    			if (card_body_slot) card_body_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { cardImage } = $$props;
    	let { minImgHeight = "100px" } = $$props;
    	let { goBackBtn = false } = $$props;

    	// export let cardImgageAlt = "Card image";
    	const dispatch = createEventDispatcher();

    	function goBack() {
    		dispatch("goBack", {});
    	}

    	function dispatchCardClick() {
    		dispatch("cardClick", {});
    	}

    	const writable_props = ["cardImage", "minImgHeight", "goBackBtn"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Card", $$slots, ['card-header','card-body']);

    	$$self.$set = $$props => {
    		if ("cardImage" in $$props) $$invalidate(0, cardImage = $$props.cardImage);
    		if ("minImgHeight" in $$props) $$invalidate(1, minImgHeight = $$props.minImgHeight);
    		if ("goBackBtn" in $$props) $$invalidate(2, goBackBtn = $$props.goBackBtn);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		cardImage,
    		minImgHeight,
    		goBackBtn,
    		dispatch,
    		goBack,
    		dispatchCardClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("cardImage" in $$props) $$invalidate(0, cardImage = $$props.cardImage);
    		if ("minImgHeight" in $$props) $$invalidate(1, minImgHeight = $$props.minImgHeight);
    		if ("goBackBtn" in $$props) $$invalidate(2, goBackBtn = $$props.goBackBtn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		cardImage,
    		minImgHeight,
    		goBackBtn,
    		goBack,
    		dispatchCardClick,
    		dispatch,
    		$$scope,
    		$$slots
    	];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			cardImage: 0,
    			minImgHeight: 1,
    			goBackBtn: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cardImage*/ ctx[0] === undefined && !("cardImage" in props)) {
    			console.warn("<Card> was created without expected prop 'cardImage'");
    		}
    	}

    	get cardImage() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cardImage(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minImgHeight() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minImgHeight(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get goBackBtn() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set goBackBtn(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue$1 = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable$1(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue$1.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue$1.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue$1.length; i += 2) {
                            subscriber_queue$1[i][0](subscriber_queue$1[i + 1]);
                        }
                        subscriber_queue$1.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const cocktails = writable$1([]);
    const ingredients = writable$1([]);
    const searchTextBox = writable$1("");

    const cocktailsStore = {
        subscribe: cocktails.subscribe,
        addCocktail: (cocktail) => {
            cocktails.update((cocktails) => {
                return [...cocktails, cocktail];
            });
        },
        setCocktails: items => {
            cocktails.set(items);
        }
    };

    const ingredientsStore = {
        subscribe: ingredients.subscribe,
        addIngredient: (ingredient) => {
            ingredients.update((ingredients) => {
                return [...ingredients, ingredient];
            });
        },
        setIngredients: items => {
            ingredients.set(items);
        }
    };

    const searchTextBoxStore = {
        subscribe: searchTextBox.subscribe,
        setSearch: text => {
            searchTextBox.set(text);
        }
    };

    /* src\cocktails\Cocktails.svelte generated by Svelte v3.22.2 */
    const file$1 = "src\\cocktails\\Cocktails.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (24:196) 
    function create_if_block_1$1(ctx) {
    	let current;

    	const card = new Card({
    			props: {
    				cardImage: /*cocktail*/ ctx[6].imageUrl
    				? /*cocktail*/ ctx[6].imageUrl
    				: /*cardImage*/ ctx[4],
    				$$slots: {
    					default: [create_default_slot_1],
    					"card-header": [create_card_header_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	card.$on("cardClick", function () {
    		if (is_function(location.href = "#/cocktail/" + /*cocktail*/ ctx[6].id)) (location.href = "#/cocktail/" + /*cocktail*/ ctx[6].id).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const card_changes = {};

    			if (dirty & /*$cocktailsStore*/ 4) card_changes.cardImage = /*cocktail*/ ctx[6].imageUrl
    			? /*cocktail*/ ctx[6].imageUrl
    			: /*cardImage*/ ctx[4];

    			if (dirty & /*$$scope, $cocktailsStore*/ 516) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(24:196) ",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#if cocktail.category             && cocktail.category.find((cat) => { return cat === selectedItem; })             && (`${JSON.stringify(cocktail.recipes)}`.toUpperCase().includes($searchTextBoxStore.toUpperCase()) || cocktail.cocktailName.toUpperCase().includes($searchTextBoxStore.toUpperCase()))}
    function create_if_block$1(ctx) {
    	let current;

    	const card = new Card({
    			props: {
    				cardImage: /*cocktail*/ ctx[6].imageUrl
    				? /*cocktail*/ ctx[6].imageUrl
    				: /*cardImage*/ ctx[4],
    				$$slots: {
    					default: [create_default_slot],
    					"card-header": [create_card_header_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	card.$on("cardClick", function () {
    		if (is_function(location.href = "#/cocktail/" + /*cocktail*/ ctx[6].id)) (location.href = "#/cocktail/" + /*cocktail*/ ctx[6].id).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const card_changes = {};

    			if (dirty & /*$cocktailsStore*/ 4) card_changes.cardImage = /*cocktail*/ ctx[6].imageUrl
    			? /*cocktail*/ ctx[6].imageUrl
    			: /*cardImage*/ ctx[4];

    			if (dirty & /*$$scope, $cocktailsStore*/ 516) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(15:8) {#if cocktail.category             && cocktail.category.find((cat) => { return cat === selectedItem; })             && (`${JSON.stringify(cocktail.recipes)}`.toUpperCase().includes($searchTextBoxStore.toUpperCase()) || cocktail.cocktailName.toUpperCase().includes($searchTextBoxStore.toUpperCase()))}",
    		ctx
    	});

    	return block;
    }

    // (26:16) <div slot="card-header" class="card-header">
    function create_card_header_slot_1(ctx) {
    	let div;
    	let span;
    	let t_value = /*cocktail*/ ctx[6].cocktailName + "";
    	let t;
    	let span_href_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "href", span_href_value = "#/cocktail/" + /*cocktail*/ ctx[6].id);
    			add_location(span, file$1, 26, 20, 1428);
    			attr_dev(div, "slot", "card-header");
    			attr_dev(div, "class", "card-header svelte-vpmei");
    			add_location(div, file$1, 25, 16, 1362);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$cocktailsStore*/ 4 && t_value !== (t_value = /*cocktail*/ ctx[6].cocktailName + "")) set_data_dev(t, t_value);

    			if (dirty & /*$cocktailsStore*/ 4 && span_href_value !== (span_href_value = "#/cocktail/" + /*cocktail*/ ctx[6].id)) {
    				attr_dev(span, "href", span_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_card_header_slot_1.name,
    		type: "slot",
    		source: "(26:16) <div slot=\\\"card-header\\\" class=\\\"card-header\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:12) <Card cardImage={cocktail.imageUrl ? cocktail.imageUrl : cardImage} on:cardClick={location.href="#/cocktail/"+cocktail.id}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(25:12) <Card cardImage={cocktail.imageUrl ? cocktail.imageUrl : cardImage} on:cardClick={location.href=\\\"#/cocktail/\\\"+cocktail.id}>",
    		ctx
    	});

    	return block;
    }

    // (19:16) <div slot="card-header" class="card-header">
    function create_card_header_slot(ctx) {
    	let div;
    	let span;
    	let t_value = /*cocktail*/ ctx[6].cocktailName + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$1, 19, 20, 885);
    			attr_dev(div, "slot", "card-header");
    			attr_dev(div, "class", "card-header svelte-vpmei");
    			add_location(div, file$1, 18, 16, 819);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$cocktailsStore*/ 4 && t_value !== (t_value = /*cocktail*/ ctx[6].cocktailName + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_card_header_slot.name,
    		type: "slot",
    		source: "(19:16) <div slot=\\\"card-header\\\" class=\\\"card-header\\\">",
    		ctx
    	});

    	return block;
    }

    // (18:12) <Card cardImage={cocktail.imageUrl ? cocktail.imageUrl : cardImage} on:cardClick={location.href="#/cocktail/"+cocktail.id}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(18:12) <Card cardImage={cocktail.imageUrl ? cocktail.imageUrl : cardImage} on:cardClick={location.href=\\\"#/cocktail/\\\"+cocktail.id}>",
    		ctx
    	});

    	return block;
    }

    // (14:4) {#each $cocktailsStore as cocktail}
    function create_each_block(ctx) {
    	let show_if;
    	let show_if_1;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_1$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*$cocktailsStore, selectedItem, $searchTextBoxStore*/ 14) show_if = !!(/*cocktail*/ ctx[6].category && /*cocktail*/ ctx[6].category.find(/*func*/ ctx[5]) && (`${JSON.stringify(/*cocktail*/ ctx[6].recipes)}`.toUpperCase().includes(/*$searchTextBoxStore*/ ctx[3].toUpperCase()) || /*cocktail*/ ctx[6].cocktailName.toUpperCase().includes(/*$searchTextBoxStore*/ ctx[3].toUpperCase())));
    		if (show_if) return 0;
    		if (dirty & /*selectedItem, $cocktailsStore, $searchTextBoxStore*/ 14) show_if_1 = !!(/*selectedItem*/ ctx[1] === "All" && (`${JSON.stringify(/*cocktail*/ ctx[6].recipes)}`.toUpperCase().includes(/*$searchTextBoxStore*/ ctx[3].toUpperCase()) || /*cocktail*/ ctx[6].cocktailName.toUpperCase().includes(/*$searchTextBoxStore*/ ctx[3].toUpperCase())));
    		if (show_if_1) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx, -1))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(14:4) {#each $cocktailsStore as cocktail}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let current;
    	let each_value = /*$cocktailsStore*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(section, "class", "svelte-vpmei");
    			add_location(section, file$1, 12, 0, 304);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$cocktailsStore, cardImage, location, selectedItem, JSON, $searchTextBoxStore*/ 30) {
    				each_value = /*$cocktailsStore*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(section, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $cocktailsStore,
    		$$unsubscribe_cocktailsStore = noop,
    		$$subscribe_cocktailsStore = () => ($$unsubscribe_cocktailsStore(), $$unsubscribe_cocktailsStore = subscribe(cocktailsStore, $$value => $$invalidate(2, $cocktailsStore = $$value)), cocktailsStore);

    	let $searchTextBoxStore;
    	validate_store(searchTextBoxStore, "searchTextBoxStore");
    	component_subscribe($$self, searchTextBoxStore, $$value => $$invalidate(3, $searchTextBoxStore = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_cocktailsStore());
    	let { cocktailsStore } = $$props;
    	validate_store(cocktailsStore, "cocktailsStore");
    	$$subscribe_cocktailsStore();
    	let { selectedItem } = $$props;
    	let cardImage = "https://i.pinimg.com/originals/59/9b/83/599b83ec328efed7750cac987a98b55b.jpg";
    	const writable_props = ["cocktailsStore", "selectedItem"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cocktails> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Cocktails", $$slots, []);

    	const func = cat => {
    		return cat === selectedItem;
    	};

    	$$self.$set = $$props => {
    		if ("cocktailsStore" in $$props) $$subscribe_cocktailsStore($$invalidate(0, cocktailsStore = $$props.cocktailsStore));
    		if ("selectedItem" in $$props) $$invalidate(1, selectedItem = $$props.selectedItem);
    	};

    	$$self.$capture_state = () => ({
    		Card,
    		searchTextBoxStore,
    		cocktailsStore,
    		selectedItem,
    		cardImage,
    		$cocktailsStore,
    		$searchTextBoxStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("cocktailsStore" in $$props) $$subscribe_cocktailsStore($$invalidate(0, cocktailsStore = $$props.cocktailsStore));
    		if ("selectedItem" in $$props) $$invalidate(1, selectedItem = $$props.selectedItem);
    		if ("cardImage" in $$props) $$invalidate(4, cardImage = $$props.cardImage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		cocktailsStore,
    		selectedItem,
    		$cocktailsStore,
    		$searchTextBoxStore,
    		cardImage,
    		func
    	];
    }

    class Cocktails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { cocktailsStore: 0, selectedItem: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cocktails",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cocktailsStore*/ ctx[0] === undefined && !("cocktailsStore" in props)) {
    			console.warn("<Cocktails> was created without expected prop 'cocktailsStore'");
    		}

    		if (/*selectedItem*/ ctx[1] === undefined && !("selectedItem" in props)) {
    			console.warn("<Cocktails> was created without expected prop 'selectedItem'");
    		}
    	}

    	get cocktailsStore() {
    		throw new Error("<Cocktails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cocktailsStore(value) {
    		throw new Error("<Cocktails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedItem() {
    		throw new Error("<Cocktails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedItem(value) {
    		throw new Error("<Cocktails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\UI\HorizontalMenu.svelte generated by Svelte v3.22.2 */

    const file$2 = "src\\UI\\HorizontalMenu.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (13:12) {:else}
    function create_else_block(ctx) {
    	let li;
    	let t_value = /*menuItem*/ ctx[4] + "";
    	let t;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-7mr4k9");
    			add_location(li, file$2, 13, 16, 303);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    			if (remount) dispose();
    			dispose = listen_dev(li, "click", /*click_handler_1*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuItems*/ 1 && t_value !== (t_value = /*menuItem*/ ctx[4] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(13:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:12) {#if menuItem === selectedItem}
    function create_if_block$2(ctx) {
    	let li;
    	let t_value = /*menuItem*/ ctx[4] + "";
    	let t;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "selected svelte-7mr4k9");
    			add_location(li, file$2, 11, 16, 219);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    			if (remount) dispose();
    			dispose = listen_dev(li, "click", /*click_handler*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuItems*/ 1 && t_value !== (t_value = /*menuItem*/ ctx[4] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(11:12) {#if menuItem === selectedItem}",
    		ctx
    	});

    	return block;
    }

    // (10:8) {#each menuItems as menuItem}
    function create_each_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*menuItem*/ ctx[4] === /*selectedItem*/ ctx[1]) return create_if_block$2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(10:8) {#each menuItems as menuItem}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let nav;
    	let ul;
    	let each_value = /*menuItems*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-7mr4k9");
    			add_location(ul, file$2, 8, 4, 113);
    			attr_dev(nav, "class", "svelte-7mr4k9");
    			add_location(nav, file$2, 7, 0, 102);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*menuItems, selectedItem*/ 3) {
    				each_value = /*menuItems*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { menuItems = ["All"] } = $$props;
    	let { selectedItem = "All" } = $$props;
    	const writable_props = ["menuItems", "selectedItem"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HorizontalMenu> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("HorizontalMenu", $$slots, []);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("menuItems" in $$props) $$invalidate(0, menuItems = $$props.menuItems);
    		if ("selectedItem" in $$props) $$invalidate(1, selectedItem = $$props.selectedItem);
    	};

    	$$self.$capture_state = () => ({ menuItems, selectedItem });

    	$$self.$inject_state = $$props => {
    		if ("menuItems" in $$props) $$invalidate(0, menuItems = $$props.menuItems);
    		if ("selectedItem" in $$props) $$invalidate(1, selectedItem = $$props.selectedItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [menuItems, selectedItem, click_handler, click_handler_1];
    }

    class HorizontalMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { menuItems: 0, selectedItem: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HorizontalMenu",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get menuItems() {
    		throw new Error("<HorizontalMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menuItems(value) {
    		throw new Error("<HorizontalMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedItem() {
    		throw new Error("<HorizontalMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedItem(value) {
    		throw new Error("<HorizontalMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function tick_spring(ctx, last_value, current_value, target_value) {
        if (typeof current_value === 'number' || is_date(current_value)) {
            // @ts-ignore
            const delta = target_value - current_value;
            // @ts-ignore
            const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
            const spring = ctx.opts.stiffness * delta;
            const damper = ctx.opts.damping * velocity;
            const acceleration = (spring - damper) * ctx.inv_mass;
            const d = (velocity + acceleration) * ctx.dt;
            if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
                return target_value; // settled
            }
            else {
                ctx.settled = false; // signal loop to keep ticking
                // @ts-ignore
                return is_date(current_value) ?
                    new Date(current_value.getTime() + d) : current_value + d;
            }
        }
        else if (Array.isArray(current_value)) {
            // @ts-ignore
            return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
        }
        else if (typeof current_value === 'object') {
            const next_value = {};
            for (const k in current_value)
                // @ts-ignore
                next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
            // @ts-ignore
            return next_value;
        }
        else {
            throw new Error(`Cannot spring ${typeof current_value} values`);
        }
    }
    function spring(value, opts = {}) {
        const store = writable(value);
        const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
        let last_time;
        let task;
        let current_token;
        let last_value = value;
        let target_value = value;
        let inv_mass = 1;
        let inv_mass_recovery_rate = 0;
        let cancel_task = false;
        function set(new_value, opts = {}) {
            target_value = new_value;
            const token = current_token = {};
            if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
                cancel_task = true; // cancel any running animation
                last_time = now();
                last_value = new_value;
                store.set(value = target_value);
                return Promise.resolve();
            }
            else if (opts.soft) {
                const rate = opts.soft === true ? .5 : +opts.soft;
                inv_mass_recovery_rate = 1 / (rate * 60);
                inv_mass = 0; // infinite mass, unaffected by spring forces
            }
            if (!task) {
                last_time = now();
                cancel_task = false;
                task = loop(now => {
                    if (cancel_task) {
                        cancel_task = false;
                        task = null;
                        return false;
                    }
                    inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
                    const ctx = {
                        inv_mass,
                        opts: spring,
                        settled: true,
                        dt: (now - last_time) * 60 / 1000
                    };
                    const next_value = tick_spring(ctx, last_value, value, target_value);
                    last_time = now;
                    last_value = value;
                    store.set(value = next_value);
                    if (ctx.settled)
                        task = null;
                    return !ctx.settled;
                });
            }
            return new Promise(fulfil => {
                task.promise.then(() => {
                    if (token === current_token)
                        fulfil();
                });
            });
        }
        const spring = {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe,
            stiffness,
            damping,
            precision
        };
        return spring;
    }

    /* src\UI\Header.svelte generated by Svelte v3.22.2 */

    const { console: console_1 } = globals;
    const file$3 = "src\\UI\\Header.svelte";

    function create_fragment$3(ctx) {
    	let header;
    	let h1;
    	let t1;
    	let div;
    	let button;
    	let svg;
    	let path;
    	let t2;
    	let input;
    	let input_focused_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "BardeMecum";
    			t1 = space();
    			div = element("div");
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t2 = space();
    			input = element("input");
    			attr_dev(h1, "class", "svelte-11hoq0o");
    			add_location(h1, file$3, 32, 4, 733);
    			attr_dev(path, "d", "M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z");
    			add_location(path, file$3, 36, 238, 1122);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			add_location(svg, file$3, 36, 8, 892);
    			attr_dev(button, "class", "searchBtn svelte-11hoq0o");
    			add_location(button, file$3, 35, 6, 832);
    			attr_dev(input, "class", "searchBox svelte-11hoq0o");
    			attr_dev(input, "focused", input_focused_value = !/*collapsed*/ ctx[0]);
    			set_style(input, "width", /*$inputSize*/ ctx[3] - 1.85 + "rem");
    			add_location(input, file$3, 38, 6, 1548);
    			attr_dev(div, "class", "searchBoxContainer svelte-11hoq0o");
    			set_style(div, "width", /*$inputSize*/ ctx[3] + "rem");
    			add_location(div, file$3, 34, 4, 760);
    			attr_dev(header, "class", "svelte-11hoq0o");
    			add_location(header, file$3, 31, 2, 719);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, div);
    			append_dev(div, button);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			append_dev(div, t2);
    			append_dev(div, input);
    			/*input_binding*/ ctx[9](input);
    			set_input_value(input, /*searchTextBox*/ ctx[2]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button, "click", /*toggleSearch*/ ctx[4], false, false, false),
    				listen_dev(input, "input", /*input_input_handler*/ ctx[10])
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*collapsed*/ 1 && input_focused_value !== (input_focused_value = !/*collapsed*/ ctx[0])) {
    				attr_dev(input, "focused", input_focused_value);
    			}

    			if (dirty & /*$inputSize*/ 8) {
    				set_style(input, "width", /*$inputSize*/ ctx[3] - 1.85 + "rem");
    			}

    			if (dirty & /*searchTextBox*/ 4 && input.value !== /*searchTextBox*/ ctx[2]) {
    				set_input_value(input, /*searchTextBox*/ ctx[2]);
    			}

    			if (dirty & /*$inputSize*/ 8) {
    				set_style(div, "width", /*$inputSize*/ ctx[3] + "rem");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			/*input_binding*/ ctx[9](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $searchTextBoxStore;
    	let $inputSize;
    	validate_store(searchTextBoxStore, "searchTextBoxStore");
    	component_subscribe($$self, searchTextBoxStore, $$value => $$invalidate(6, $searchTextBoxStore = $$value));
    	let collapsed = true;
    	let searchInput;

    	function toggleSearch() {
    		inputSize.set(collapsed ? 20 : 1.85);
    		collapsed ? searchInput.focus() : clearSearch();
    		$$invalidate(0, collapsed = !collapsed);
    	}

    	let inputSize = spring(1.85);
    	validate_store(inputSize, "inputSize");
    	component_subscribe($$self, inputSize, value => $$invalidate(3, $inputSize = value));
    	let searchTextBox = "";

    	function searchText(text) {
    		console.log(text);
    		searchTextBoxStore.setSearch(text);
    		console.log($searchTextBoxStore);
    	}

    	function clearSearch() {
    		searchText("");
    		$$invalidate(1, searchInput.value = "", searchInput);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, searchInput = $$value);
    		});
    	}

    	function input_input_handler() {
    		searchTextBox = this.value;
    		$$invalidate(2, searchTextBox);
    	}

    	$$self.$capture_state = () => ({
    		spring,
    		searchTextBoxStore,
    		collapsed,
    		searchInput,
    		toggleSearch,
    		inputSize,
    		searchTextBox,
    		searchText,
    		clearSearch,
    		$searchTextBoxStore,
    		$inputSize
    	});

    	$$self.$inject_state = $$props => {
    		if ("collapsed" in $$props) $$invalidate(0, collapsed = $$props.collapsed);
    		if ("searchInput" in $$props) $$invalidate(1, searchInput = $$props.searchInput);
    		if ("inputSize" in $$props) $$invalidate(5, inputSize = $$props.inputSize);
    		if ("searchTextBox" in $$props) $$invalidate(2, searchTextBox = $$props.searchTextBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*searchTextBox*/ 4) {
    			 searchText(searchTextBox);
    		}
    	};

    	return [
    		collapsed,
    		searchInput,
    		searchTextBox,
    		$inputSize,
    		toggleSearch,
    		inputSize,
    		$searchTextBoxStore,
    		searchText,
    		clearSearch,
    		input_binding,
    		input_input_handler
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\cocktails\CocktailItem.svelte generated by Svelte v3.22.2 */
    const file$4 = "src\\cocktails\\CocktailItem.svelte";

    // (33:0) {#if cocktail}
    function create_if_block$3(ctx) {
    	let div;
    	let section;
    	let current;

    	const card = new Card({
    			props: {
    				cardImage: /*cocktail*/ ctx[0].imageUrl
    				? /*cocktail*/ ctx[0].imageUrl
    				: /*cardImage*/ ctx[1],
    				minImgHeight: "300px",
    				goBackBtn: "/",
    				$$slots: {
    					default: [create_default_slot$1],
    					"card-body": [create_card_body_slot],
    					"card-header": [create_card_header_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	card.$on("goBack", goBack);

    	const block = {
    		c: function create() {
    			div = element("div");
    			section = element("section");
    			create_component(card.$$.fragment);
    			attr_dev(section, "class", "svelte-lq41xs");
    			add_location(section, file$4, 35, 8, 883);
    			attr_dev(div, "class", "container svelte-lq41xs");
    			add_location(div, file$4, 33, 4, 844);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, section);
    			mount_component(card, section, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};

    			if (dirty & /*cocktail*/ 1) card_changes.cardImage = /*cocktail*/ ctx[0].imageUrl
    			? /*cocktail*/ ctx[0].imageUrl
    			: /*cardImage*/ ctx[1];

    			if (dirty & /*$$scope, cocktail*/ 33) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(card);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(33:0) {#if cocktail}",
    		ctx
    	});

    	return block;
    }

    // (38:16) <div slot="card-header" class="card-header">
    function create_card_header_slot$1(ctx) {
    	let div;
    	let t_value = /*cocktail*/ ctx[0].cocktailName + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "slot", "card-header");
    			attr_dev(div, "class", "card-header svelte-lq41xs");
    			add_location(div, file$4, 37, 16, 1050);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cocktail*/ 1 && t_value !== (t_value = /*cocktail*/ ctx[0].cocktailName + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_card_header_slot$1.name,
    		type: "slot",
    		source: "(38:16) <div slot=\\\"card-header\\\" class=\\\"card-header\\\">",
    		ctx
    	});

    	return block;
    }

    // (41:16) <div slot="card-body" class="card-body">
    function create_card_body_slot(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let p;
    	let t2_value = /*cocktail*/ ctx[0].recipes[0] + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Recipes";
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			add_location(h2, file$4, 41, 20, 1243);
    			add_location(p, file$4, 43, 24, 1350);
    			attr_dev(div, "slot", "card-body");
    			attr_dev(div, "class", "card-body svelte-lq41xs");
    			add_location(div, file$4, 40, 16, 1181);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cocktail*/ 1 && t2_value !== (t2_value = /*cocktail*/ ctx[0].recipes[0] + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_card_body_slot.name,
    		type: "slot",
    		source: "(41:16) <div slot=\\\"card-body\\\" class=\\\"card-body\\\">",
    		ctx
    	});

    	return block;
    }

    // (37:12) <Card cardImage={cocktail.imageUrl ? cocktail.imageUrl : cardImage} on:goBack={goBack} minImgHeight={"300px"} goBackBtn={"/"}>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(37:12) <Card cardImage={cocktail.imageUrl ? cocktail.imageUrl : cardImage} on:goBack={goBack} minImgHeight={\\\"300px\\\"} goBackBtn={\\\"/\\\"}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*cocktail*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*cocktail*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*cocktail*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function goBack() {
    	location.href = "#/";
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $cocktailsStore;
    	validate_store(cocktailsStore, "cocktailsStore");
    	component_subscribe($$self, cocktailsStore, $$value => $$invalidate(2, $cocktailsStore = $$value));
    	let cocktail = {};

    	// $: cocktail = $cocktailsStore[0];
    	//url: #/cocktail/{cocktail.id}
    	let url = new URL(window.location.href);

    	let id = url.hash.split("/")[url.hash.indexOf("cocktail")];
    	let cardImage = "https://i.pinimg.com/originals/59/9b/83/599b83ec328efed7750cac987a98b55b.jpg";

    	if (!cocktailsStore || cocktailsStore.length === 0) {
    		window.location.href = "/";
    	}

    	if (id) {
    		cocktail = $cocktailsStore.find(item => {
    			return item.id == id;
    		});

    		if (!cocktail) {
    			window.location.href = "/";
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CocktailItem> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CocktailItem", $$slots, []);

    	$$self.$capture_state = () => ({
    		Card,
    		cocktailsStore,
    		cocktail,
    		url,
    		id,
    		cardImage,
    		goBack,
    		$cocktailsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("cocktail" in $$props) $$invalidate(0, cocktail = $$props.cocktail);
    		if ("url" in $$props) url = $$props.url;
    		if ("id" in $$props) id = $$props.id;
    		if ("cardImage" in $$props) $$invalidate(1, cardImage = $$props.cardImage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cocktail, cardImage];
    }

    class CocktailItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CocktailItem",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.22.2 */
    const file$5 = "src\\App.svelte";

    // (46:0) {#if $url.hash.indexOf("cocktail") > 0}
    function create_if_block$4(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	const cocktailitem = new CocktailItem({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(cocktailitem.$$.fragment);
    			attr_dev(div, "class", "overlay svelte-1xpucbk");
    			add_location(div, file$5, 46, 1, 1265);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(cocktailitem, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cocktailitem.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(
    					div,
    					fly,
    					{
    						delay: 0,
    						duration: 500,
    						x: 1000,
    						y: 0,
    						opacity: 0.5,
    						easing: quintOut
    					},
    					true
    				);

    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cocktailitem.$$.fragment, local);

    			if (!div_transition) div_transition = create_bidirectional_transition(
    				div,
    				fly,
    				{
    					delay: 0,
    					duration: 500,
    					x: 1000,
    					y: 0,
    					opacity: 0.5,
    					easing: quintOut
    				},
    				false
    			);

    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(cocktailitem);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(46:0) {#if $url.hash.indexOf(\\\"cocktail\\\") > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let t0;
    	let t1;
    	let main;
    	let t2;
    	let show_if = /*$url*/ ctx[1].hash.indexOf("cocktail") > 0;
    	let if_block_anchor;
    	let current;
    	const header = new Header({ $$inline: true });

    	const horizontalmenu = new HorizontalMenu({
    			props: {
    				menuItems: /*menuItems*/ ctx[2],
    				selectedItem: /*selectedItem*/ ctx[0]
    			},
    			$$inline: true
    		});

    	horizontalmenu.$on("click", /*changeMenuItem*/ ctx[3]);

    	const cocktails = new Cocktails({
    			props: {
    				cocktailsStore,
    				selectedItem: /*selectedItem*/ ctx[0]
    			},
    			$$inline: true
    		});

    	let if_block = show_if && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(horizontalmenu.$$.fragment);
    			t1 = space();
    			main = element("main");
    			create_component(cocktails.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(main, "class", "svelte-1xpucbk");
    			add_location(main, file$5, 42, 0, 1158);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(horizontalmenu, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(cocktails, main, null);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const horizontalmenu_changes = {};
    			if (dirty & /*selectedItem*/ 1) horizontalmenu_changes.selectedItem = /*selectedItem*/ ctx[0];
    			horizontalmenu.$set(horizontalmenu_changes);
    			const cocktails_changes = {};
    			if (dirty & /*selectedItem*/ 1) cocktails_changes.selectedItem = /*selectedItem*/ ctx[0];
    			cocktails.$set(cocktails_changes);
    			if (dirty & /*$url*/ 2) show_if = /*$url*/ ctx[1].hash.indexOf("cocktail") > 0;

    			if (show_if) {
    				if (if_block) {
    					if (dirty & /*$url*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(horizontalmenu.$$.fragment, local);
    			transition_in(cocktails.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(horizontalmenu.$$.fragment, local);
    			transition_out(cocktails.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(horizontalmenu, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			destroy_component(cocktails);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));

    	fetch("https://thecocktaildbapp-default-rtdb.europe-west1.firebasedatabase.app/cocktails.json").then(response => response.json()).then(data => {
    		cocktailsStore.setCocktails(data);
    	});

    	fetch("https://thecocktaildbapp-default-rtdb.europe-west1.firebasedatabase.app/ingredients.json").then(response => response.json()).then(data => {
    		ingredientsStore.setIngredients(data);
    	});

    	let menuItems = ["All", "Popular", "New", "Bartender's Choice"];
    	let selectedItem = "All";

    	function changeMenuItem(event) {
    		$$invalidate(0, selectedItem = event.target.innerText);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		fly,
    		quintOut,
    		url,
    		Cocktails,
    		HorizontalMenu,
    		Header,
    		CocktailItem,
    		cocktailsStore,
    		ingredientsStore,
    		menuItems,
    		selectedItem,
    		changeMenuItem,
    		$url
    	});

    	$$self.$inject_state = $$props => {
    		if ("menuItems" in $$props) $$invalidate(2, menuItems = $$props.menuItems);
    		if ("selectedItem" in $$props) $$invalidate(0, selectedItem = $$props.selectedItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedItem, $url, menuItems, changeMenuItem];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
