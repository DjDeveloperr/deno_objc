//
//  testLib.h
//  testLib
//
//  Created by Helloyunho on 2022/01/30.
//

#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>

@interface testLib : NSObject

@property int year;
@property NSString *title;
@property NSString *author;

- (void)initWithTitle:(NSString *)title author:(NSString *)author year:(int)year;

- (NSString *)bookInfoWithComment:(NSString *)comment;

@end

typedef struct {
    bool shouldClose;
} WindowState;

@interface WindowDelegate : NSObject <NSWindowDelegate> {
    WindowState *state;
}

@property(nonatomic, readwrite) WindowState *state;

- (void)initWithState:(WindowState*)state;

- (BOOL)windowShouldClose:(id)sender;

- (void)windowWillClose:(NSNotification *)notification;

@end
