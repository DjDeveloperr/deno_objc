//
//  main.m
//  testApp
//
//  Created by Helloyunho on 2022/03/26.
//

#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>

bool exit_app = false;

@interface WindowDelegate : NSObject <NSWindowDelegate>
@end

@interface ViewController : NSViewController
@end

@implementation WindowDelegate

- (BOOL)windowShouldClose:(id)sender {
    return YES;
}

- (void)windowWillClose:(NSNotification *)notification {
    exit_app = true;
}

@end

@implementation ViewController

- (NSView*)loadView {
    NSView* view = [[NSView alloc] initWithFrame:NSMakeRect(0, 0, 800, 600)];
    view.wantsLayer = YES;
    view.autoresizesSubviews = YES;
    view.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
    self.view = view;
    return view;
}

@end

void updateEvents() {
    while (true) {
        NSEvent *event = [NSApp nextEventMatchingMask:NSAnyEventMask
                                        untilDate:[NSDate distantPast]
                                           inMode:NSDefaultRunLoopMode
                                          dequeue:YES];
        if (event) {
            [NSApp sendEvent:event];
        } else {
            break;
        }
    }
}

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        [NSApplication sharedApplication];
        [NSApp setActivationPolicy:0];

        NSWindow* window = [[NSWindow alloc] initWithContentRect:NSMakeRect(0, 0, 800, 600)
                                            styleMask:1 | 2 | 4 | 8
                                            backing:2
                                            defer:NO];
        [window setDelegate:[[WindowDelegate alloc] init]];
        [window setTitle:@"testApp"];
        [window makeKeyAndOrderFront:NSApp];
        [window setReleasedWhenClosed: NO];
        [window setAcceptsMouseMovedEvents:YES];

        window.contentViewController = [[ViewController alloc] initWithNibName: nil bundle: nil];
        NSView* contentView = window.contentView;

        NSMutableArray* views = [NSMutableArray array];

        for (int i = 0; i < 5; i++) {
            NSTextField* label = [NSTextField textFieldWithString:@"Hello World"];
            [label setBezeled:NO];
            [label setEditable:NO];
            [label setSelectable:NO];
            [views addObject:label];
        }

        NSStackView* vstack = [NSStackView stackViewWithViews:views];
        [vstack setOrientation:NSUserInterfaceLayoutOrientationVertical];
        [vstack setSpacing:10];
        [vstack setAlignment:5];
        [vstack setDistribution:NSStackViewDistributionFill];
        vstack.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
        [contentView addSubview:vstack];

        [window center];

        [NSApp activateIgnoringOtherApps:YES];

        while (true) {
            if (exit_app) {
                return 0;
            }
            updateEvents();
            [contentView setNeedsDisplay:YES];
        }
    }
    return 0;
}
