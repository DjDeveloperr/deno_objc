//
//  testLib.h
//  testLib
//
//  Created by Helloyunho on 2022/01/30.
//

#import <Foundation/Foundation.h>

@interface testLib : NSObject

@property int year;
@property NSString *title;
@property NSString *author;

- (void)initWithTitle:(NSString *)title author:(NSString *)author year:(int)year;

- (NSString *)bookInfoWithComment:(NSString *)comment;

@end
// change the language to objc
// done
// but now idk objc
// neither do i
// objc speedrun les go