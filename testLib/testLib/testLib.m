//
//  testLib.m
//  testLib
//
//  Created by Helloyunho on 2022/01/30.
//

#import "testLib.h"

@implementation testLib

- (void) initWithTitle:(NSString *)title author:(NSString *)author year:(int)year {
    self.title = title;
    self.author = author;
    self.year = year;
}

- (NSString *)bookInfoWithComment:(NSString *)comment {
    return [NSString stringWithFormat:@"%@ - %@ - %@, %d", self.title, self.author, comment, self.year];
}

@end
